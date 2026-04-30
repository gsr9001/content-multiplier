import { BRAND_VOICE } from '../config.js';

export function buildSystemPrompt(articleText) {
  return `${BRAND_VOICE}\n\nHere is the source article you will be working from:\n\n${articleText}`;
}
