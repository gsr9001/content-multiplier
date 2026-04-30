import { readFileSync, existsSync } from 'fs';
import { extname, basename } from 'path';

export function readArticle(filePath) {
  if (!filePath) {
    console.error('Usage: node generate.js <source-article.md>');
    process.exit(1);
  }
  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  if (extname(filePath).toLowerCase() !== '.md') {
    console.error(`Expected a .md file, got: ${filePath}`);
    process.exit(1);
  }

  const text = readFileSync(filePath, 'utf8').trim();
  if (text.length < 100) {
    console.error('Article is too short to generate content from.');
    process.exit(1);
  }

  const filename = basename(filePath, '.md');
  return { text, filename };
}
