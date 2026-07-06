# WashMate Homepage Assets — Minimal v2

Created: 2026-07-06

This package intentionally avoids the previous mistake of generating many fake/placeholder production assets.

## What is included now

- `00_reference_sections/`: 10 approved homepage section references in the new **WashMate Premium Navy Clean** style.
- Production folders: clean folders with precise requirements only.
- Docs: manifest, section map, design tokens, Claude prompt, and file list.

## What is NOT included yet

The real production image assets are **not filled with placeholders**. They must be added only when they are truly production-ready.

Do not use fake icons, cartoon service images, or simplified medals like the rejected v1 production pack.

## Critical rule

Reference section images are for layout only. Do not crop them to create production assets.

For UI icons, Claude should use `lucide-react`, inline SVG, or CSS—not image files—unless a specific production SVG is provided.
