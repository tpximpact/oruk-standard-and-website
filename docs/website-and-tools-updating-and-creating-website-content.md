# Website and tools — updating and creating website content

## Purpose

This document explains how to update and create website content for the Open Referral UK site, including the key files, conventions, and supporting tools. It is intended for both content editors and developers.

## Content architecture (high level)

### 1) Markdown pages (most pages)

Content pages live in the content/ directory. The app reads Markdown files and renders them using a shared template.

- content/ contains section folders such as about/, adopt/, developers/, community/, case-studies/, info/, and not-found/.
- Each Markdown file typically includes YAML frontmatter (between --- lines) plus Markdown content.
- The navigation structure and page routes are defined in content/sitemap.json.

### 2) JSON-driven content (home page)

The home page is driven by JSON content rather than Markdown:

- content/home/index.json contains the hero, boxes, and conclusion content.
- Fields with \_md suffix accept Markdown, and some fields allow inline HTML (for example list markup).

### 3) Static assets

Static files are served from public/.

- Images: public/...
- PDFs: public/pdf/...
- Refer to assets with absolute paths (e.g., /pdf/guide.pdf or /adopt/diagram.png).

## Frontmatter conventions

Markdown frontmatter is parsed with gray-matter and passed through to the page templates. Some pages include only modified, while others include title and slug (especially dynamic sections).

Common fields:

- title: The page title used by dynamic sections and lists.
- slug: A human-readable label shown in some dynamic sections.
- modified: ISO timestamp string used for “last updated” dates.

Notes:

- The modified date is used for display and is updated via a script.
- If you add new frontmatter fields, ensure the page templates account for them.

## Updating existing content

### Markdown pages

1. Find the relevant file in content/.
2. Edit the Markdown content.
3. Update frontmatter if needed (e.g., title changes).
4. Update the modified date.

Tip: Use the frontmatter updater script to update modified dates across all Markdown files:

- yarn upd

### Home page

Edit content/home/index.json:

- hero.headline and hero.content_md control the hero section.
- boxes is an array of callouts.
- conclusion contains content blocks, including optional HTML lists.

## Creating new content

### A) Add a new page in an existing section

1. Create a Markdown file under the right section folder (content/\<section\>/).
2. Add frontmatter (at least modified, and title if this is in a dynamic section).
3. Add your Markdown body.
4. Update content/sitemap.json so the page appears in navigation or page lists.

Example frontmatter:

```yaml
---
title: Example page title
slug: Example page label
modified: '2026-01-31T00:00:00.000Z'
---
```

### B) Dynamic sections (about, case-studies, etc.)

Dynamic sections use a folder of Markdown files and generate pages automatically. The slug is derived from the filename.

Conventions:

- Use numeric prefixes to control ordering (e.g., 10-introducing.md).
- Include title and slug in frontmatter for list display.
- Ensure the section entry in content/sitemap.json has "dynamic": true.

### C) New top-level section

1. Create a new folder under content/.
2. Add index.md as the landing page (with frontmatter).
3. Add an entry to content/sitemap.json (name, label, urlPath, contentPath).
4. Add childNodes for subpages if needed.

## Navigation and page lists

Navigation is built from content/sitemap.json.

Key fields:

- name: Internal identifier (used by routing and lookups).
- label: Text shown in menus and page lists.
- urlPath: URL segment (without leading slash for nested items).
- contentPath: Folder path under content/.
- childNodes: Subpages, either as entries or names.
- dynamic: If true, child pages are derived from files in the content folder.
- autoMenu: Controls automatic side menus on pages.
- offsite: True for external links.

If a page does not appear in the menu or list, check sitemap.json first.

## Redirects

If an old URL needs to be redirected to a new location, update src/redirects.json. Redirects can also point to external URLs.

## Tools and workflows

### Frontmatter updater

The script src/scripts/update-frontmatter.ts updates modified dates for Markdown files:

- yarn upd

Use this before release to ensure “last updated” dates are accurate.

### Local preview

Use the development server to preview content changes locally before deploying.

## Quality checklist

- Content renders correctly in Markdown (headings, links, lists).
- Frontmatter is present and accurate.
- modified date is updated.
- New pages are listed in content/sitemap.json when required.
- Images and PDFs are stored in public/ and referenced with absolute paths.
- External links open correctly and are up to date.

## Troubleshooting

- Page shows 404: Confirm content/sitemap.json includes the page and the contentPath is correct.
- Page renders without content: Check the Markdown file path and extension.
- Missing “next/previous” in dynamic sections: Ensure files are numbered and include title in frontmatter.
- Date not updated: Run the frontmatter updater script and re-check the modified field.
