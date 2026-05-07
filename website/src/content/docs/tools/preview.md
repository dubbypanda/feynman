---
title: Preview
description: Preview generated research artifacts as rendered HTML or PDF.
section: Tools
order: 5
---

The preview tool renders generated artifacts as polished HTML or PDF documents and opens them in your browser or PDF viewer. This is particularly useful for research briefs, paper drafts, and any document that contains LaTeX math, tables, or complex formatting that does not render well in a terminal.

## Usage

Inside the REPL, preview the most recent artifact:

```
/preview
```

Feynman suggests previewing automatically when you generate artifacts that benefit from rendered output. You can also preview a specific file:

```
/preview outputs/scaling-laws-brief.md
```

## Requirements

Preview requires `pandoc` for Markdown-to-HTML and Markdown-to-PDF rendering. Install the preview dependencies with:

```bash
feynman setup preview
```

On macOS with Homebrew, the setup command attempts to install pandoc automatically. On Linux, it checks for pandoc in your package manager. If the automatic install does not work, install pandoc manually from [pandoc.org](https://pandoc.org/installing.html) and rerun `feynman setup preview` to verify.

## Supported formats

The preview tool handles three output formats:

- **Markdown** -- Rendered as HTML with full LaTeX math support via KaTeX, syntax-highlighted code blocks, and clean typography
- **HTML** -- Opened directly in your default browser with no conversion step
- **PDF** -- Generated via pandoc with LaTeX rendering, suitable for sharing or printing

## How it works

The `pi-markdown-preview` package handles the rendering pipeline. For Markdown files, it converts to HTML with a clean stylesheet, proper code highlighting, and rendered math equations. The preview opens in your default browser as a local file.

For documents with heavy math notation (common in research drafts), the preview ensures all LaTeX expressions render correctly. Inline math (`$...$`) and display math (`$$...$$`) are both supported. Tables, citation lists, and nested blockquotes all render with proper formatting.

## Customization

The preview stylesheet is designed for research documents and includes styles for proper heading hierarchy, code blocks with syntax highlighting, tables with clean borders, math equations (inline and display), citation formatting, and blockquotes. The stylesheet is bundled with the package and does not require any configuration.
