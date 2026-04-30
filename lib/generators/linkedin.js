import { MODEL } from '../../config.js';

export async function generateLinkedIn(client, systemPrompt) {
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Write 5 LinkedIn posts based on the source article.

Requirements:
- Each post: 150–200 words
- Engaging hook in the first line (no "I" as the first word)
- Pull a specific quote or data point from the article for at least 3 posts
- End each post with a question or call-to-action to drive comments
- Use short paragraphs (1–2 sentences max) and line breaks for readability
- No hashtags

Format your response exactly like this, with no extra text before or after:

=== POST 1 ===
[post content]

=== POST 2 ===
[post content]

=== POST 3 ===
[post content]

=== POST 4 ===
[post content]

=== POST 5 ===
[post content]`,
      },
    ],
  });

  const text = response.choices[0].message.content;
  const posts = text
    .split(/===\s*POST\s*\d+\s*===/)
    .map(s => s.trim())
    .filter(Boolean);

  return { posts, usage: response.usage };
}
