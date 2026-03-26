#!/usr/bin/env bash
# Pre-push check: catches track-isolation issues before they reach the remote.
# Installed automatically by `npm install` via the `prepare` script.
# Run manually: bash scripts/pre-push-check.sh

set -e
ROOT="$(git rev-parse --show-toplevel)"
FAIL=0

red()   { echo -e "\033[31m✗ $*\033[0m"; }
green() { echo -e "\033[32m✓ $*\033[0m"; }
warn()  { echo -e "\033[33m⚠ $*\033[0m"; }

echo ""
echo "Running pre-push checks..."
echo ""

# ── 1. ESLint ────────────────────────────────────────────────────────────────
if npm run lint --silent 2>&1; then
  green "ESLint passed"
else
  red "ESLint failed"
  FAIL=1
fi

# ── 2. Curriculum validator ──────────────────────────────────────────────────
if node "$ROOT/scripts/validate-curriculum.js" > /dev/null 2>&1; then
  green "Curriculum validation passed"
else
  red "Curriculum validation failed — run: node scripts/validate-curriculum.js"
  FAIL=1
fi

# ── 3. Track-isolation anti-patterns ────────────────────────────────────────
# Files in scope: app/ and components/ (exclude generated code and .next)
SCOPE="$ROOT/app $ROOT/components"

# 3a. Bare CURRICULUM import used directly (should use getTrackById instead)
#     Allow: import lines and the definition in index.ts itself
BARE=$(grep -rn --include="*.ts" --include="*.tsx" \
  "CURRICULUM\b" $SCOPE 2>/dev/null \
  | grep -v "generated" | grep -v "\.next" \
  | grep -v "^.*import.*CURRICULUM" \
  | grep -v "getTrackById.*CURRICULUM" \
  | grep -v "??.*CURRICULUM" \
  || true)
if [ -n "$BARE" ]; then
  red "Direct CURRICULUM usage (not as fallback after getTrackById):"
  echo "$BARE" | sed 's/^/    /'
  FAIL=1
else
  green "No bare CURRICULUM usages"
fi

# 3b. Hardcoded month count (/ 12) in JSX/TS — should use curriculum.length
HARDCODED=$(grep -rn --include="*.tsx" \
  "/ 12\b" $SCOPE 2>/dev/null \
  | grep -v "\.next" | grep -v "generated" \
  || true)
if [ -n "$HARDCODED" ]; then
  red "Hardcoded '/ 12' month count — use curriculum.length instead:"
  echo "$HARDCODED" | sed 's/^/    /'
  FAIL=1
else
  green "No hardcoded month counts"
fi

# 3c. Old block-ID regex that misses prefixed IDs like py-m1w1-b1
OLD_REGEX=$(grep -rn --include="*.ts" --include="*.tsx" \
  "match.*\^m\\\\d" $SCOPE 2>/dev/null \
  | grep -v "\.next" | grep -v "generated" \
  || true)
if [ -n "$OLD_REGEX" ]; then
  red "Legacy block-ID regex (^m\\d+w\\d+) — use /m(\\d+)w(\\d+)-/ instead:"
  echo "$OLD_REGEX" | sed 's/^/    /'
  FAIL=1
else
  green "No legacy block-ID regexes"
fi

# 3d. blockProgress.findMany without blockId scope (cross-track leak risk)
#     Check 5 lines of context after each findMany call for a blockId filter.
#     progress/page.tsx intentionally queries all (historical view) — excluded.
UNSCOPED=$(python3 - "$ROOT" "$SCOPE" <<'PYEOF'
import sys, re
from pathlib import Path

root = Path(sys.argv[1])
scope_dirs = sys.argv[2].split()
hits = []

for d in scope_dirs:
    for f in Path(d).rglob("*.ts*"):
        if "generated" in str(f) or ".next" in str(f):
            continue
        text = f.read_text(errors="replace")
        for m in re.finditer(r"blockProgress\.findMany\(", text):
            window = text[m.start():m.start()+400]
            if "blockId" not in window:
                line_no = text[:m.start()].count("\n") + 1
                rel = f.relative_to(root)
                hits.append(f"  {rel}:{line_no}")

print("\n".join(hits))
PYEOF
)
if [ -n "$UNSCOPED" ]; then
  warn "blockProgress.findMany without blockId filter — verify intentional:"
  echo "$UNSCOPED"
else
  green "All blockProgress.findMany calls include a blockId filter"
fi

# 3e. monthlyProject queries without track filter
UNSCOPED_PROJ=$(python3 - "$ROOT" "$SCOPE" <<'PYEOF'
import sys, re
from pathlib import Path

root = Path(sys.argv[1])
scope_dirs = sys.argv[2].split()
hits = []

for d in scope_dirs:
    for f in Path(d).rglob("*.ts*"):
        if "generated" in str(f) or ".next" in str(f):
            continue
        text = f.read_text(errors="replace")
        for pattern in [r"monthlyProject\.findMany\(", r"monthlyProject\.findUnique\("]:
            for m in re.finditer(pattern, text):
                window = text[m.start():m.start()+400]
                if "track" not in window:
                    line_no = text[:m.start()].count("\n") + 1
                    rel = f.relative_to(root)
                    hits.append(f"  {rel}:{line_no}")

print("\n".join(hits))
PYEOF
)
if [ -n "$UNSCOPED_PROJ" ]; then
  warn "monthlyProject query without track filter — verify intentional:"
  echo "$UNSCOPED_PROJ"
else
  green "All monthlyProject queries include a track filter"
fi

echo ""
if [ "$FAIL" -eq 1 ]; then
  red "Pre-push checks FAILED — fix the issues above before pushing."
  echo ""
  exit 1
else
  green "All checks passed."
  echo ""
  exit 0
fi
