import { MODEL } from '../../config.js';

export async function generateTweets(client, systemPrompt) {
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 800,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Write 10 tweets based on the source article.

Requirements:
- Each tweet must be under 280 characters (count carefully)
- Mix of formats: a stat, a quote, a hot take, a tip, a question
- Pull real numbers or quotes from the article where possible
- Punchy, direct — no filler words
- No hashtags

Format your response as a numbered list only, no intro text:

1. [tweet]
2. [tweet]
3. [tweet]
4. [tweet]
5. [tweet]
6. [tweet]
7. [tweet]
8. [tweet]
9. [tweet]
10. [tweet]`,
      },
    ],
  });

  const text = response.choices[0].message.content;
  const tweets = text
    .split(/\n/)
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(line => line.length > 0 && !line.match(/^\d+\.?\s*$/));

  return { tweets: tweets.slice(0, 10), usage: response.usage };
}
