import { MODEL } from '../../config.js';

export async function generateNewsletter(client, systemPrompt) {
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Write 3 newsletter sections based on the source article.

Requirements:
- Each section: 200–300 words
- Start with a compelling header line (formatted as: Header: [title])
- Conversational tone — like writing to a friend who trusts your expertise
- Include at least one specific quote or example from the article
- End each section with one clear action item the reader can take today
- Short paragraphs, plain language

Format your response exactly like this, with no extra text before or after:

=== SECTION 1 ===
Header: [section title]

[section content]

=== SECTION 2 ===
Header: [section title]

[section content]

=== SECTION 3 ===
Header: [section title]

[section content]`,
      },
    ],
  });

  const text = response.choices[0].message.content;
  const sections = text
    .split(/===\s*SECTION\s*\d+\s*===/)
    .map(s => s.trim())
    .filter(Boolean);

  return { sections, usage: response.usage };
}
