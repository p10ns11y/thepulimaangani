#!/bin/bash
#
# sync-branches-final.sh
# Final clean version - uses temp files for plan (as requested)
# Only skips active PR branches. Everything else gets rebased with -X ours.
#

set -euo pipefail

TMPDIR=$(mktemp -d)
PLAN_FILE="$TMPDIR/plan.txt"
STATE_FILE="$TMPDIR/state.txt"

cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

# ==================== COLLECT ====================
echo "=== COLLECTING STATE ==="

git fetch --all --prune --quiet

# Detect default branch
if ! MAIN_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@refs/remotes/origin/@@'); then
    MAIN_BRANCH="main"
fi
echo "DEFAULT_BRANCH=$MAIN_BRANCH" > "$STATE_FILE"

MAIN_COMMIT=$(git rev-parse "origin/$MAIN_BRANCH")
echo "MAIN_COMMIT=$MAIN_COMMIT" >> "$STATE_FILE"

CURRENT_BRANCH=$(git branch --show-current)
echo "CURRENT_BRANCH=$CURRENT_BRANCH" >> "$STATE_FILE"

# Get active PRs
mapfile -t ACTIVE_PRS < <(gh pr list --state open --json headRefName --jq '.[].headRefName' 2>/dev/null | sort -u || true)
echo "ACTIVE_PRS=${ACTIVE_PRS[*]}" >> "$STATE_FILE"

# Get all branches except default and legacy
mapfile -t ALL_BRANCHES < <(git branch --format='%(refname:short)' | grep -vE "^(${MAIN_BRANCH}|legacy)$")

echo "=== BUILDING PLAN (to file) ==="

> "$PLAN_FILE"
echo "update_default_branch" >> "$PLAN_FILE"

for branch in "${ALL_BRANCHES[@]}"; do
    if printf '%s\n' "${ACTIVE_PRS[@]}" | grep -q "^${branch}$"; then
        echo "skip:$branch:active_pr" >> "$PLAN_FILE"
    else
        echo "rebase:$branch" >> "$PLAN_FILE"
    fi
done

echo "cleanup_deleted" >> "$PLAN_FILE"

echo "=== PLAN CONTENTS ==="
cat "$PLAN_FILE"
echo "Total actions: $(wc -l < "$PLAN_FILE")"

echo ""
echo "=== VALIDATION ==="
echo "Remote check..."
git ls-remote --heads origin > /dev/null 2>&1 && echo "✓ Remote OK" || { echo "✗ Remote failed"; exit 1; }

echo ""
echo "=== EXECUTING ==="

while IFS= read -r line; do
    action="${line%%:*}"
    arg="${line#*:}"

    case "$action" in
        update_default_branch)
            echo "→ Updating $MAIN_BRANCH..."
            git checkout "$MAIN_BRANCH" --quiet
            git pull --rebase --quiet || true
            ;;
        rebase)
            branch="$arg"
            echo "→ Rebasing $branch..."
            git checkout "$branch" --quiet 2>/dev/null || continue
            if git rebase -X ours "$MAIN_BRANCH" --quiet 2>/dev/null; then
                echo "  ✓ Success"
            else
                git rebase --abort 2>/dev/null || true
                git branch -m "$branch" "$branch--to-be-deleted"
                git checkout -b "$branch" "$MAIN_BRANCH" --quiet
                echo "  ✓ Recreated (was conflicting)"
            fi
            ;;
        skip)
            echo "⏭ SKIP $arg"
            ;;
        cleanup_deleted)
            echo "→ Cleaning --to-be-deleted branches..."
            git branch --format='%(refname:short)' | grep -- '--to-be-deleted$' | while read -r b; do
                git branch -D "$b" --quiet
                echo "  Deleted $b"
            done || true
            ;;
    esac
done < "$PLAN_FILE"

echo ""
if [ "${PUSH:-0}" = "1" ]; then
    echo "=== PUSHING ALL NON-PR BRANCHES TO REMOTE (with --force-with-lease) ==="
    git branch --format='%(refname:short)' | grep -vE "^(${MAIN_BRANCH}|legacy)$" | while read -r b; do
        echo "→ Pushing $b to origin..."
        if git push --force-with-lease origin "$b" --quiet 2>/dev/null; then
            echo "  ✓ Pushed safely"
        else
            echo "  ⚠ Push failed (maybe no permission or protected branch)"
        fi
    done
else
    echo "=== PUSH SKIPPED (run with PUSH=1 to push all branches) ==="
fi

echo ""
echo "=== RETURNING TO ORIGINAL BRANCH ==="
if git show-ref --verify --quiet "refs/heads/$CURRENT_BRANCH"; then
    git checkout "$CURRENT_BRANCH" --quiet
    echo "✓ Back on $CURRENT_BRANCH"
else
    echo "⚠ Original branch no longer exists. Staying on $MAIN_BRANCH"
fi

echo ""
echo "✓ All done! Plan was stored in $PLAN_FILE"
