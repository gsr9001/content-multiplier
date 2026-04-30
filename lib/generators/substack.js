import { MODEL } from '../../config.js';

export async function generateSubstack(client, systemPrompt) {
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 1200,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Write 3 Substack Notes based on the source article.

Requirements:
- Each note: 80–150 words
- Optimized for scannability: use short paragraphs (1–2 sentences), line breaks, and occasional bullet points
- Each note should be a standalone insight — a surprising stat, a contrarian take, or a key takeaway
- Pull specific quotes, numbers, or examples from the article
- End with a one-line hook that invites readers to think or respond
- Conversational tone — feels personal, not corporate
- No hashtags

Format your response exactly like this, with no extra text before or after:

=== NOTE 1 ===
[note content]

=== NOTE 2 ===
[note content]

=== NOTE 3 ===
[note content]`,
      },
    ],
  });

  const text = response.choices[0].message.content;
  const notes = text
    .split(/===\s*NOTE\s*\d+\s*===/)
    .map(s => s.trim())
    .filter(Boolean);

  return { notes: notes.slice(0, 3), usage: response.usage };
}
