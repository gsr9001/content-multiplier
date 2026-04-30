import OpenAI from 'openai';
import { join } from 'path';
import { readArticle } from './lib/reader.js';
import { buildSystemPrompt } from './lib/cache.js';
import { setupOutputDir, writeArticle } from './lib/writer.js';
import { generateCalendar } from './lib/calendar.js';
import { generateLinkedIn } from './lib/generators/linkedin.js';
import { generateTweets } from './lib/generators/tweets.js';
import { generateNewsletter } from './lib/generators/newsletter.js';
import { generateYouTube } from './lib/generators/youtube.js';
import { generateSubstack } from './lib/generators/substack.js';
import { writeFileSync } from 'fs';

const client = new OpenAI();

async function run() {
  const filePath = process.argv[2];
  const { text, filename } = readArticle(filePath);

  const today = new Date();
  const slug = `${today.toISOString().slice(0, 19).replace(/:/g, '-')}_${filename}`;
  const outputBase = setupOutputDir(slug);

  console.log(`\nContent Multiplier — ${filename}`);
  console.log(`Output: ${outputBase}\n`);

  const systemPrompt = buildSystemPrompt(text);
  const results = { linkedin: [], tweets: [], newsletter: [], youtube: [], youtubeTitles: [], substack: [] };
  const errors = [];
  let totalInputTokens = 0;
  let totalCachedTokens = 0;

  function trackUsage(usage, label) {
    const input = usage?.prompt_tokens ?? 0;
    const cached = usage?.prompt_tokens_details?.cached_tokens ?? 0;
    totalInputTokens += input;
    totalCachedTokens += cached;
    if (cached > 0) console.log(`  [${label}] Cache hit: ${cached} tokens`);
  }

  // 1. LinkedIn
  process.stdout.write('Generating LinkedIn posts...');
  try {
    const { posts, usage } = await generateLinkedIn(client, systemPrompt);
    results.linkedin = posts;
    console.log(` done (${posts.length} posts)`);
    trackUsage(usage, 'LinkedIn');
  } catch (err) {
    handleError(err, 'LinkedIn', errors);
  }

  // 2. Tweets
  process.stdout.write('Generating tweets...');
  try {
    const { tweets, usage } = await generateTweets(client, systemPrompt);
    results.tweets = tweets;
    console.log(` done (${tweets.length} tweets)`);
    trackUsage(usage, 'Tweets');
  } catch (err) {
    handleError(err, 'Tweets', errors);
  }

  // 3. Newsletter
  process.stdout.write('Generating newsletter sections...');
  try {
    const { sections, usage } = await generateNewsletter(client, systemPrompt);
    results.newsletter = sections;
    console.log(` done (${sections.length} sections)`);
    trackUsage(usage, 'Newsletter');
  } catch (err) {
    handleError(err, 'Newsletter', errors);
  }

  // 4. YouTube
  process.stdout.write('Generating YouTube scripts...');
  try {
    const { scripts, titles, usage } = await generateYouTube(client, systemPrompt);
    results.youtube = scripts;
    results.youtubeTitles = titles;
    console.log(` done (${scripts.length} scripts)`);
    trackUsage(usage, 'YouTube');
  } catch (err) {
    handleError(err, 'YouTube', errors);
  }

  // 5. Substack Notes
  process.stdout.write('Generating Substack notes...');
  try {
    const { notes, usage } = await generateSubstack(client, systemPrompt);
    results.substack = notes;
    console.log(` done (${notes.length} notes)`);
    trackUsage(usage, 'Substack');
  } catch (err) {
    handleError(err, 'Substack', errors);
  }

  // Write LinkedIn files
  results.linkedin.forEach((post, i) => {
    const n = String(i + 1).padStart(2, '0');
    writeArticle(
      join(outputBase, 'linkedin'),
      `linkedin-${n}.md`,
      { type: 'linkedin', source: filename, index: i + 1 },
      post
    );
  });

  // Write tweets file (all in one)
  if (results.tweets.length > 0) {
    const tweetsContent = results.tweets
      .map((t, i) => `${i + 1}. ${t}`)
      .join('\n\n');
    writeArticle(
      join(outputBase, 'tweets'),
      'tweets.md',
      { type: 'tweets', source: filename, count: results.tweets.length },
      tweetsContent
    );
  }

  // Write newsletter files
  results.newsletter.forEach((section, i) => {
    const n = String(i + 1).padStart(2, '0');
    writeArticle(
      join(outputBase, 'newsletter'),
      `newsletter-${n}.md`,
      { type: 'newsletter', source: filename, index: i + 1 },
      section
    );
  });

  // Write YouTube script files
  results.youtube.forEach((script, i) => {
    const n = String(i + 1).padStart(2, '0');
    const title = results.youtubeTitles[i] || `Script ${i + 1}`;
    writeArticle(
      join(outputBase, 'youtube'),
      `youtube-script-${n}.md`,
      { type: 'youtube', source: filename, index: i + 1, title },
      script
    );
  });

  // Write Substack note files
  results.substack.forEach((note, i) => {
    const n = String(i + 1).padStart(2, '0');
    writeArticle(
      join(outputBase, 'substack'),
      `substack-note-${n}.md`,
      { type: 'substack', source: filename, index: i + 1 },
      note
    );
  });

  // Generate and write content calendar
  const calendar = generateCalendar(today, filename, {
    linkedin: results.linkedin,
    tweets: results.tweets,
    newsletter: results.newsletter,
    youtube: results.youtube,
    substack: results.substack,
  });
  writeFileSync(join(outputBase, 'content-calendar.md'), calendar, 'utf8');

  // Summary
  console.log('\n--- Summary ---');
  console.log(`LinkedIn posts:      ${results.linkedin.length}/5`);
  console.log(`Tweets:              ${results.tweets.length}/10`);
  console.log(`Newsletter sections: ${results.newsletter.length}/3`);
  console.log(`YouTube scripts:     ${results.youtube.length}/2`);
  console.log(`Substack notes:      ${results.substack.length}/3`);
  console.log(`Input tokens:         ${totalInputTokens}`);
  console.log(`Cached tokens:        ${totalCachedTokens}`);
  if (totalCachedTokens > 0) {
    const savings = Math.round((totalCachedTokens * 0.5) / 1000);
    console.log(`Estimated cache savings: ~${savings}K tokens`);
  }
  if (errors.length > 0) {
    console.log('\nFailed generators:');
    errors.forEach(e => console.log(`  - ${e}`));
  }
  console.log(`\nAll files saved to: ${outputBase}`);
}

function handleError(err, label, errors) {
  console.log(` FAILED`);
  if (err instanceof OpenAI.AuthenticationError) {
    console.error('\nAuthentication failed. Check your OPENAI_API_KEY in .env');
    process.exit(1);
  }
  console.error(`  [${label}] ${err.message}`);
  errors.push(label);
}

run().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
