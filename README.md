# Content Multiplier

Turn a single article into a full week of content — LinkedIn posts, tweets, newsletter sections, YouTube scripts, Substack notes, and a content calendar. Powered by OpenAI with prompt caching to minimize API costs.

## What it generates

From one markdown article, you get:

| Format | Count |
|--------|-------|
| LinkedIn posts | 5 |
| Tweets | 10 |
| Newsletter sections | 3 |
| YouTube scripts | 2 |
| Substack notes | 3 |
| Content calendar | 1 |

All files are saved to a timestamped output folder, organized by platform.

## Requirements

- Node.js 18+
- An OpenAI API key

## Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/YOUR_USERNAME/content-multiplier.git
cd content-multiplier
npm install
```

2. Create a `.env` file from the example:

```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OUTPUT_DIR=output
```

## Usage

```bash
node generate.js your-article.md
```

Or use the npm script with the included sample article:

```bash
npm test
```

Output is saved to `output/<timestamp>_<filename>/` with subfolders per platform:

```
output/
└── 2024-01-15T10-30-00_my-article/
    ├── linkedin/
    │   ├── linkedin-01.md
    │   └── linkedin-02.md
    ├── tweets/
    │   └── tweets.md
    ├── newsletter/
    │   └── newsletter-01.md
    ├── youtube/
    │   └── youtube-script-01.md
    ├── substack/
    │   └── substack-note-01.md
    └── content-calendar.md
```

## Custom brand voice

By default, the tool writes in a casual, practical style — short sentences, actionable takeaways, no buzzwords.

To use your own voice, create a `brand-voice.txt` file in the project root and describe your tone and rules. The tool will use it automatically.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | required | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model to use |
| `OUTPUT_DIR` | `output` | Where to save generated files |

## How it works

1. Reads your article and builds a shared system prompt with the full article text
2. Sends parallel requests to OpenAI for each content type
3. Uses prompt caching — the article is sent once and cached across all requests, cutting costs significantly
4. Writes each piece of content as a separate markdown file with metadata frontmatter

## License

MIT
