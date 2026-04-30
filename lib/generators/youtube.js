import { MODEL } from '../../config.js';

export async function generateYouTube(client, systemPrompt) {
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Write 2 YouTube video scripts based on the source article.

Requirements:
- Each script: ~800 spoken words (about 5–6 minutes at normal speaking pace)
- Use different angles — one can be a deep-dive, the other a practical how-to
- Structure each script with labeled sections: INTRO, MAIN CONTENT, OUTRO
- INTRO: Hook in first 15 seconds (question, bold claim, or surprising stat from the article), then tell viewers what they'll learn
- MAIN CONTENT: 3–4 clearly labeled sub-points with transitions between them; use real examples and quotes from the source
- OUTRO: Summarize the key takeaway, include a call-to-action (subscribe, comment, or next video)
- Write for spoken delivery — short sentences, natural pauses, no walls of text
- Include [PAUSE], [B-ROLL: description], or [ON SCREEN: text] cues where helpful

Format your response exactly like this, with no extra text before or after:

=== SCRIPT 1: [Title] ===

INTRO
[intro content]

MAIN CONTENT
[main content with sub-points]

OUTRO
[outro content]

=== SCRIPT 2: [Title] ===

INTRO
[intro content]

MAIN CONTENT
[main content with sub-points]

OUTRO
[outro content]`,
      },
    ],
  });

  const text = response.choices[0].message.content;
  const scripts = text
    .split(/===\s*SCRIPT\s*\d+:[^=]*===/)
    .map(s => s.trim())
    .filter(Boolean);

  const titles = [...text.matchAll(/===\s*SCRIPT\s*\d+:\s*([^=]+?)\s*===/g)].map(m => m[1].trim());

  return { scripts, titles, usage: response.usage };
}
