## Description

<!-- What does this PR add or change? -->

---

## Curriculum contribution checklist
<!-- Only fill this out if you are adding/editing content in content/curriculum/tracks/ -->
<!-- Delete this section for non-curriculum PRs -->

- [ ] **Track**: `javascript` / `python` / other: ___
- [ ] **Month**: Month ___
- [ ] Block IDs follow the convention: `{track}-m{month}w{week}-b{n}` (e.g. `py-m1w2-b3`)
  - Exception: JavaScript track uses legacy format `m{month}w{week}-b{n}` for existing blocks
- [ ] Each block has all required fields: `id`, `title`, `description`, `durationMinutes`, `type`
- [ ] Quiz questions (if included) have exactly 4 options, a `correctIndex` (0–3), and an `explanation`
- [ ] No duplicate block IDs (the CI validator will catch these)
- [ ] Tested locally: `node scripts/validate-curriculum.js` passes with no errors
- [ ] New track: `meta.json` is present with all required fields

---

## Other changes checklist
<!-- For non-curriculum PRs -->

- [ ] Changes are focused and described above
- [ ] No unrelated changes bundled in this PR
- [ ] Tests pass (if applicable): `npm test`
