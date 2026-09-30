# OmniParse AI — Agentic Code & Theory Summarizer
**Live:** https://nikhil-creat.github.io/summerize_ai/

OmniParse AI compresses long source code and technical theory into short, meaningful summaries without losing the logic. A team of AI agents (Planner, Extractor, Compressor, Verifier, Editor) writes the summary, then checks length, your focus keywords and unverified identifiers before showing it.

## Features
- Length slider (10–90%) with presets, output styles (Executive, Beginner, Interview Q&A, Cheat-sheet, Code review) and languages (English, Telugu, Hindi, Tamil, Spanish)
- Focus keywords: highlighted everywhere, and their sentences are preserved
- Agentic pipeline with live trace; offline extractive fallback needs no key
- Integrity guard, source trace (tap a bullet), side-by-side diff, concept graph, flashcard quiz
- Export: Markdown, TXT, PDF, Anki CSV, JSON, and a copy-ready text box
- Installable offline PWA, four neon themes, run history

## Privacy
Runs entirely in the browser. Text goes only to the provider you choose with your own API key (Groq, Gemini, OpenAI-compatible), or nowhere in offline mode.

## Deploy on GitHub Pages
1. Push all files to the repo root (`main`).
2. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
3. Open `https://<username>.github.io/<repo>/`.

No build step. Paths are relative, so renaming the repo needs no code changes.

## Tech stack
Vanilla JS, HTML5 Canvas, PDF.js, Service Worker, GitHub Pages.

## License
MIT © Nikhil Chary Sriramoju
