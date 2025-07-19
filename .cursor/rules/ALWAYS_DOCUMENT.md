# ✍️ ALWAYS DOCUMENT
Purpose: Auto-version every edit; commits go to git with a short message + README patch.

Rules
- After **every** accepted, applied or even **rejected** diff you:
  1. **Patch README.md** (or create `docs/CHANGELOG.md`) in **plain English**:
     ```
     | Date | Who | What & Why | Files|
     |------|-----|------------|------|
     | {date} | AI | {one line} | `foo.tsx`, `bar.css` |
     ```
  2. **`git add . && git commit -m "[ai] \`<Summary>\`"`** (no human prompt).  
- NEVER break `git bisect`; commit must keep build green (`npm run build` passes).  
- If build **red**, `git --amend` immediately with follow-up fix + doc-line.  
- For dependencies → bump `package.json` **and** changelog.  
- Attach timestamped screenshot diff for UI-only touches (Cursor Screen-capture helper). 