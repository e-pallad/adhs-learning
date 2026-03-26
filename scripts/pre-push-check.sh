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

# ── 4. Devil's advocate — logical flaw detection ────────────────────────────
# These checks look for classes of bugs that static types won't catch.

# 4a. API routes that call awardXP outside a $transaction
UNTXN_XP=$(python3 - "$ROOT" <<'PYEOF'
import sys, re
from pathlib import Path

root = Path(sys.argv[1])
hits = []

for f in (root / "app" / "api").rglob("route.ts"):
    text = f.read_text(errors="replace")
    if "awardXP" not in text:
        continue
    # awardXP must appear inside a $transaction block (either passing tx or being called within one)
    if "prisma.$transaction" not in text and "prisma\\.\\$transaction" not in text:
        hits.append(f"  {f.relative_to(root)}")

print("\n".join(hits))
PYEOF
)
if [ -n "$UNTXN_XP" ]; then
  red "awardXP called outside prisma.\$transaction — risk of double-XP:"
  echo "$UNTXN_XP" | sed 's/^/    /'
  FAIL=1
else
  green "All awardXP calls are inside a transaction"
fi

# 4b. API routes that call getCurrentUser but never check for null/unauthorized
UNGUARDED_ROUTES=$(python3 - "$ROOT" <<'PYEOF'
import sys, re
from pathlib import Path

root = Path(sys.argv[1])
hits = []

for f in (root / "app" / "api").rglob("route.ts"):
    text = f.read_text(errors="replace")
    if "getCurrentUser" not in text:
        continue
    # Must have a 401 guard after getCurrentUser
    if "401" not in text and "Unauthorized" not in text:
        hits.append(f"  {f.relative_to(root)}")

print("\n".join(hits))
PYEOF
)
if [ -n "$UNGUARDED_ROUTES" ]; then
  red "API route calls getCurrentUser but has no 401 guard:"
  echo "$UNGUARDED_ROUTES" | sed 's/^/    /'
  FAIL=1
else
  green "All getCurrentUser calls have a 401 guard"
fi

# 4c. Dynamic route params not awaited (Next.js 16: params is a Promise)
UNAWAITED_PARAMS=$(grep -rn --include="*.tsx" --include="*.ts" \
  "params\." "$ROOT/app" 2>/dev/null \
  | grep -v "\.next" | grep -v "generated" \
  | grep -v "await params" \
  | grep -v "searchParams" \
  | grep -v "//.*params\." \
  | grep "params\.\(slug\|id\|month\|week\|track\)" \
  || true)
if [ -n "$UNAWAITED_PARAMS" ]; then
  red "Route params accessed without await — use 'const { x } = await params' in Next.js 16:"
  echo "$UNAWAITED_PARAMS" | sed 's/^/    /'
  FAIL=1
else
  green "No unawaited route params"
fi

# 4d. DailyLog upserts that update xpEarned but not blocksCompleted
DAILYLOG_XP_ONLY=$(python3 - "$ROOT" <<'PYEOF'
import sys, re
from pathlib import Path

root = Path(sys.argv[1])
hits = []

for f in list((root / "app").rglob("*.ts")) + list((root / "lib").rglob("*.ts")):
    if "generated" in str(f) or ".next" in str(f):
        continue
    text = f.read_text(errors="replace")
    # Find dailyLog upsert blocks
    for m in re.finditer(r"dailyLog\.upsert\(", text):
        window = text[m.start():m.start()+600]
        has_xp = "xpEarned" in window
        has_blocks = "blocksCompleted" in window
        has_minutes = "minutesSpent" in window
        # Flag only if xpEarned is updated but neither blocksCompleted nor minutesSpent is touched
        if has_xp and not has_blocks and not has_minutes:
            line_no = text[:m.start()].count("\n") + 1
            hits.append(f"  {f.relative_to(root)}:{line_no} — updates xpEarned but not blocksCompleted/minutesSpent")

print("\n".join(hits))
PYEOF
)
if [ -n "$DAILYLOG_XP_ONLY" ]; then
  warn "DailyLog upsert updates xpEarned but not blocksCompleted — goal bars may stay at 0:"
  echo "$DAILYLOG_XP_ONLY"
else
  green "DailyLog upserts keep xpEarned and blocksCompleted in sync"
fi

# ── 5. API coverage gate ─────────────────────────────────────────────────────
# Every non-auth API route touched in this branch must have a matching
# integration test file. Naming convention:
#   app/api/<a>/<b>/route.ts  →  tests/integration/<a>-<b>.test.ts
#
# Auth routes are excluded — browser-redirect / cookie flows aren't suited
# to the integration-test harness used here.

# Find the merge base so we only check routes actually changed in this branch.
MERGE_BASE=$(git merge-base HEAD origin/master 2>/dev/null \
  || git merge-base HEAD origin/main 2>/dev/null \
  || git rev-list --max-parents=0 HEAD 2>/dev/null \
  || echo "")

if [ -n "$MERGE_BASE" ]; then
  CHANGED_API=$(git diff --name-only "$MERGE_BASE" HEAD 2>/dev/null \
    | grep "^app/api/.*/route\.ts$" \
    | grep -v "^app/api/auth/" \
    || true)
else
  CHANGED_API=""
fi

if [ -z "$CHANGED_API" ]; then
  green "No non-auth API routes modified — coverage gate skipped"
else
  COVERAGE_FAIL=0
  while IFS= read -r route_file; do
    # Derive test name: app/api/user/api-key/route.ts → user-api-key
    test_name=$(echo "$route_file" \
      | sed 's|app/api/||' \
      | sed 's|/route\.ts||' \
      | tr '/' '-')
    test_file="$ROOT/tests/integration/${test_name}.test.ts"
    if [ ! -f "$test_file" ]; then
      red "Modified API route has no integration test: $route_file"
      echo "    Expected: tests/integration/${test_name}.test.ts"
      COVERAGE_FAIL=1
    fi
  done <<< "$CHANGED_API"

  if [ "$COVERAGE_FAIL" -eq 0 ]; then
    green "All modified API routes have integration tests"
  else
    FAIL=1
  fi
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
