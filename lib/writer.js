import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { OUTPUT_DIR } from '../config.js';

export function setupOutputDir(slug) {
  const base = join(OUTPUT_DIR, slug);
  for (const sub of ['linkedin', 'tweets', 'newsletter', 'youtube', 'substack']) {
    mkdirSync(join(base, sub), { recursive: true });
  }
  return base;
}

export function writeArticle(dir, filename, frontmatter, body) {
  const fm = Object.entries(frontmatter)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n');
  const content = `---\n${fm}\n---\n\n${body.trim()}\n`;
  writeFileSync(join(dir, filename), content, 'utf8');
}
