# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a bilingual (English/Arabic) Hugo-based literary blog for "The Unhappy Folk's Literature" (blog.unhappyfolk.org). The site features poetry and philosophical writings with optional interpretations, custom theming, and RTL language support.

## Commands

### Development
```bash
# Start local development server (default port 1313)
hugo server

# Build the site (output to public/)
hugo

# Check Hugo version (requires v0.74.x+, currently using v0.151.0)
hugo version
```

### Deployment
- Automatic deployment via GitHub Actions on push to `master` branch
- GitHub Actions workflow: [.github/workflows/gh-pages.yml](.github/workflows/gh-pages.yml)
- Builds and publishes to GitHub Pages using the `chabad360/hugo-gh-pages` action

## Architecture & Structure

### Content Organization
- **Bilingual setup**: Content split between `content/en/` (English) and `content/ar/` (Arabic)
- **Content type**: Posts are stored in `content/{lang}/post/*.md`
- **Content type name**: Configured as `"post"` in [config.toml](config.toml) (not the default `"posts"`)
- Posts use page bundles or standalone markdown files with frontmatter metadata

### Theme: Hello Friend (Modified)
- Base theme: `themes/hello-friend/` (git submodule)
- **Custom partial**: [themes/hello-friend/layouts/partials/interpretation.html](themes/hello-friend/layouts/partials/interpretation.html)
  - Displays post interpretations in a bordered box with golden styling
  - Supports bilingual interpretations with tabbed switching (`interpretation` and `interpretationAr` frontmatter fields)
  - Includes inline CSS and JavaScript for tab functionality
- **Modified template**: [themes/hello-friend/layouts/_default/single.html](themes/hello-friend/layouts/_default/single.html)
  - Custom signature block with Tolkien quote and site contact info (lines 65-78)
  - Includes the interpretation partial (line 80)
- **RTL Support**: Theme automatically handles right-to-left text for Arabic via `languagedirection` config

### Configuration
- **Main config**: [config.toml](config.toml)
  - Base URL: `https://blog.unhappyfolk.org`
  - Two languages: English (default) and Arabic
  - Custom logo, header text, and menu items
  - Language-specific content directories and RTL settings
  - Dark theme as default (`defaultTheme = "dark"`)

### Post Frontmatter
Posts use TOML frontmatter with the following fields:
- `title`, `date`, `author`: Standard metadata
- `cover`, `CoverCaption`, `images`: Cover image handling
- `interpretation`: Optional English interpretation (long-form markdown string)
- `interpretationAr`: Optional Arabic interpretation
- Content follows after `+++` markers

Example structure:
```toml
+++
title = "Post Title"
date = "2023-01-01"
author = "mhashim6"
cover = "img/image.jpg"
CoverCaption = "Artist Name"
images = ['img/image.jpg']
interpretation = """
Multi-line interpretation text...
"""
+++

Post content here...
```

### Theme Modifications
To modify theme styles or templates:
1. Theme source is in `themes/hello-friend/` (git submodule)
2. Override styles: Create `static/style.css` in root
3. Override templates: Copy from `themes/hello-friend/layouts/` to `layouts/` in root and modify
4. For theme asset development:
   ```bash
   cd themes/hello-friend
   npm install && npm i yarn && yarn
   yarn dev    # Watch mode
   yarn build  # Production build
   ```

## File Organization
- `content/`: Bilingual markdown content
- `static/`: Static assets (images in `static/img/`, CNAME file)
- `themes/hello-friend/`: Theme submodule
- `archetypes/`: Post templates for `hugo new` command
- `public/`: Build output (gitignored)

## Notes
- The interpretation partial is a custom feature specific to this blog
- Posts often include theological scripture quotes and philosophical themes
- Arabic content uses RTL layout automatically via theme configuration
