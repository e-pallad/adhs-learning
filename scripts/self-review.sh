#!/usr/bin/env bash
# Self-review: print a structured diff for manual proofreading before committing.
# Usage: bash scripts/self-review.sh [--staged | --last | --branch <base>]
#
# Modes:
#   --staged       Review what is staged (default)
#   --last         Review the last commit
#   --branch BASE  Review all commits since branching from BASE

set -e

red()   { echo -e "\033[31m$*\033[0m"; }
green() { echo -e "\033[32m$*\033[0m"; }
cyan()  { echo -e "\033[36m$*\033[0m"; }
bold()  { echo -e "\033[1m$*\033[0m"; }

MODE="${1:---staged}"
BASE="${2:-master}"

echo ""
bold "═══════════════════════════════════════════════"
bold "  SELF-REVIEW — Proofread before you push"
bold "═══════════════════════════════════════════════"
echo ""

# ── Show changed files ───────────────────────────────────────────────────────
if [ "$MODE" = "--staged" ]; then
  FILES=$(git diff --staged --name-only)
  DIFF_CMD="git diff --staged"
elif [ "$MODE" = "--last" ]; then
  FILES=$(git diff HEAD~1 HEAD --name-only)
  DIFF_CMD="git diff HEAD~1 HEAD"
elif [ "$MODE" = "--branch" ]; then
  FILES=$(git diff "$BASE"...HEAD --name-only)
  DIFF_CMD="git diff $BASE...HEAD"
else
  red "Unknown mode: $MODE"
  echo "Usage: bash scripts/self-review.sh [--staged | --last | --branch <base>]"
  exit 1
fi

if [ -z "$FILES" ]; then
  echo "No changes to review."
  exit 0
fi

cyan "Changed files:"
echo "$FILES" | sed 's/^/  /'
echo ""

# ── Checklist ────────────────────────────────────────────────────────────────
bold "Review checklist:"
echo "  [ ] Each change does exactly what the commit message claims"
echo "  [ ] No adjacent code is accidentally broken"
echo "  [ ] API routes: auth guard present, 401 on missing user"
echo "  [ ] API routes: XP awarded inside prisma.\$transaction"
echo "  [ ] API routes: correct DB fields updated (e.g. blocksCompleted, minutesSpent)"
echo "  [ ] Client components: AudioContext/Realtime/subscriptions cleaned up on unmount"
echo "  [ ] Dynamic route params are awaited (Next.js 16)"
echo "  [ ] New public paths added to proxy.ts PUBLIC_PATHS if needed"
echo "  [ ] No hardcoded track names, month counts, or block-ID formats"
echo ""

# ── Per-file diff with section headers ──────────────────────────────────────
bold "Per-file diffs:"
echo ""

while IFS= read -r file; do
  if [ -z "$file" ]; then continue; fi
  cyan "── $file ──────────────────────────"
  if [ "$MODE" = "--staged" ]; then
    git diff --staged -- "$file" | tail -n +5 | head -200
  elif [ "$MODE" = "--last" ]; then
    git diff HEAD~1 HEAD -- "$file" | tail -n +5 | head -200
  else
    git diff "$BASE"...HEAD -- "$file" | tail -n +5 | head -200
  fi
  echo ""
done <<< "$FILES"

# ── Run automated checks ─────────────────────────────────────────────────────
bold "═══════════════════════════════════════════════"
bold "  Running automated pre-push checks..."
bold "═══════════════════════════════════════════════"
echo ""
bash "$(git rev-parse --show-toplevel)/scripts/pre-push-check.sh"
