# CLAUDE_USE_ASSETS_PROMPT

Read this folder before coding.

## Important
- Use `00_reference_sections/` only as visual layout reference.
- Do not crop reference images into production assets.
- Do not use old rejected placeholder assets.
- Production folders currently contain requirements only unless real files are later added.
- UI icons should use `lucide-react`, inline SVG, or CSS.

## Coding goal
Code the homepage `/` following the 10 reference sections in `00_reference_sections/` using the **WashMate Premium Navy Clean** style.

## Asset usage
When real production assets are added later, copy them into `public/images/washmate/` and reference them as `/images/washmate/...`.

If a production asset is missing, build the component with CSS/HTML and use a clean empty state or gradient placeholder, but clearly report which asset is missing.

## Scope
- Only modify FE files needed for the homepage.
- Do not modify Backend.
- Do not modify Admin/Staff/Customer portal unless requested.
- Do not commit or push.
- Run build after changes and report changed files.
