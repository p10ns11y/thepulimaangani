#!/bin/bash
#
# sync-branches.sh — Simple One-Color-Per-Phase Version
# Clean, consistent, and beautiful
#

set -euo pipefail

# ==================== CONFIG ====================
DRY_RUN="${DRY_RUN:-0}"
PUSH="${PUSH:-0}"

TMPDIR=$(mktemp -d)
PLAN_FILE="$TMPDIR/plan.txt"

cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

# ==================== SIMPLE COLORS (One per phase) ====================
C_PHASE1='\033[38;2;100;180;255m'      # Soft Blue - Collect
C_PHASE2='\033[38;2;80;220;255m'       # Cyan - Build Plan
C_PHASE3='\033[38;2;255;200;80m'       # Warm Yellow - Validate
C_PHASE4='\033[38;2;200;50;70m'        # Red Velvet - Sync
C_SUCCESS='\033[38;2;80;220;140m'      # Green
C_ERROR='\033[38;2;180;20;40m'         # Blood Red - Errors
C_RESET='\033[0m'

ORIGINAL_BRANCH=""
MAIN_BRANCH=""
MAIN_COMMIT=""
IS_DIRTY=0
STASH_NAME=""

# Create a local branch tracking origin/<name> when it exists on the remote but not locally.
# Without this, sync only touches branches that already exist locally (see AGENTS.md / sync docs).
ensure_remote_tracking_locals() {
    echo -e "${C_PHASE1}→ Ensuring local tracking branches for origin/*...${C_RESET}"
    local created=0
    while IFS= read -r short; do
        [ -z "$short" ] && continue
        [ "$short" = "HEAD" ] && continue
        if git show-ref --verify --quiet "refs/heads/$short" 2>/dev/null; then
            continue
        fi
        if ! git show-ref --verify --quiet "refs/remotes/origin/$short" 2>/dev/null; then
            continue
        fi
        if [ "$DRY_RUN" = "1" ]; then
            echo "   [DRY] Would create local branch $short → origin/$short"
            created=1
            continue
        fi
        if git branch --track "$short" "origin/$short" --quiet 2>/dev/null; then
            echo "   + $short → origin/$short"
            created=1
        fi
    done < <(
        git for-each-ref refs/remotes/origin --format='%(refname:short)' |
            sed 's|^origin/||' |
            grep -vxF HEAD |
            sort -u
    )
    if [ "$created" = "0" ]; then
        echo "   (no new local branches needed)"
    fi
}

# ==================== PHASE 1: COLLECT (Blue) ====================
collect_state() {
    echo -e "\n${C_PHASE1}╔════════════════════════════════════════════════════════════╗${C_RESET}"
    echo -e "${C_PHASE1}║ PHASE 1: Collecting Repository State                       ║${C_RESET}"
    echo -e "${C_PHASE1}╚════════════════════════════════════════════════════════════╝${C_RESET}\n"

    # Capture original branch FIRST, before any checkout
    ORIGINAL_BRANCH=$(git branch --show-current)

    echo -e "${C_PHASE1}→ Fetching latest from remote...${C_RESET}"
    git fetch --all --prune --quiet

    ensure_remote_tracking_locals

    if ! MAIN_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@refs/remotes/origin/@@'); then
        for candidate in main master malar; do
            if git show-ref --verify --quiet "refs/remotes/origin/$candidate"; then
                MAIN_BRANCH="$candidate"
                break
            fi
        done
    fi
    [ -z "$MAIN_BRANCH" ] && { echo -e "${C_ERROR}ERROR: No default branch found${C_RESET}"; exit 1; }

    # Make sure local main branch is also up to date (use --rebase for squash-merge safety)
    git checkout "$MAIN_BRANCH" --quiet 2>/dev/null || true
    git pull --rebase --autostash --quiet 2>/dev/null || git pull --rebase --quiet 2>/dev/null || true

    echo "   Default branch:     $MAIN_BRANCH"
    MAIN_COMMIT=$(git rev-parse "origin/$MAIN_BRANCH")
    echo "   Latest commit:      $(git rev-parse --short $MAIN_COMMIT)"

    echo "   Current branch:     $ORIGINAL_BRANCH"

    if ! git diff --quiet || ! git diff --cached --quiet; then
        IS_DIRTY=1
        echo "   Working tree:       DIRTY"
    else
        echo "   Working tree:       CLEAN"
    fi

    mapfile -t ALL_BRANCHES < <(git branch --format='%(refname:short)' | grep -vE "^(${MAIN_BRANCH}|legacy)$")
    echo "   Branches to sync:   ${#ALL_BRANCHES[@]} (legacy ignored)"

    echo -e "${C_PHASE1}→ Fetching open PRs via gh...${C_RESET}"
    mapfile -t ACTIVE_PRS < <(gh pr list --state open --json headRefName --jq '.[].headRefName' 2>/dev/null | sort -u || true)
    echo "   Active PRs:         ${#ACTIVE_PRS[@]}"

    echo -e "\n${C_SUCCESS}✓ State collection complete${C_RESET}\n"
}

# ==================== PHASE 2: BUILD PLAN (Cyan) ====================
build_plan() {
    echo -e "${C_PHASE2}╔════════════════════════════════════════════════════════════╗${C_RESET}"
    echo -e "${C_PHASE2}║ PHASE 2: Building Execution Plan (file-based)              ║${C_RESET}"
    echo -e "${C_PHASE2}╚════════════════════════════════════════════════════════════╝${C_RESET}\n"

    > "$PLAN_FILE"
    echo "update_default_branch" >> "$PLAN_FILE"

    [ "$IS_DIRTY" = "1" ] && echo "stash_changes" >> "$PLAN_FILE"

    for branch in "${ALL_BRANCHES[@]}"; do
        if printf '%s\n' "${ACTIVE_PRS[@]}" | grep -q "^${branch}$"; then
            echo "skip:$branch:active_pr" >> "$PLAN_FILE"
        else
            echo "rebase:$branch" >> "$PLAN_FILE"
        fi
    done

    echo "cleanup_deleted" >> "$PLAN_FILE"
    [ "$IS_DIRTY" = "1" ] && echo "restore_stash" >> "$PLAN_FILE"
    [ "$ORIGINAL_BRANCH" != "$MAIN_BRANCH" ] && echo "checkout_original" >> "$PLAN_FILE"

    echo "Plan written to file ($(wc -l < "$PLAN_FILE") actions)"
    echo -e "${C_SUCCESS}✓ Plan built successfully${C_RESET}\n"
}

# ==================== PHASE 3: VALIDATE (Yellow) ====================
validate_plan() {
    echo -e "${C_PHASE3}╔════════════════════════════════════════════════════════════╗${C_RESET}"
    echo -e "${C_PHASE3}║ PHASE 3: Pre-Execution Validation                          ║${C_RESET}"
    echo -e "${C_PHASE3}╚════════════════════════════════════════════════════════════╝${C_RESET}\n"

    echo "→ Checking remote connectivity..."
    if git ls-remote --heads origin > /dev/null 2>&1; then
        echo "   ✓ Remote reachable"
    else
        echo -e "${C_ERROR}✗ Cannot reach remote${C_RESET}"
        exit 1
    fi
    echo -e "\n${C_SUCCESS}✓ Validation passed — ready to sync${C_RESET}\n"
}

# ==================== PHASE 4: SYNC (Green) ====================
sync() {
    echo -e "${C_PHASE4}╔════════════════════════════════════════════════════════════╗${C_RESET}"
    echo -e "${C_PHASE4}║ PHASE 4: Syncing Branches                                  ║${C_RESET}"
    echo -e "${C_PHASE4}╚════════════════════════════════════════════════════════════╝${C_RESET}\n"

    while IFS= read -r line; do
        action="${line%%:*}"
        arg="${line#*:}"

        case "$action" in
            update_default_branch)
                echo "→ Updating $MAIN_BRANCH (rebase mode)..."
                git checkout "$MAIN_BRANCH" --quiet
                if [ "$(git rev-parse HEAD)" = "$(git rev-parse "origin/$MAIN_BRANCH")" ]; then
                    echo "   ✓ Already up to date"
                else
                    echo "   → Rebasing..."
                    git pull --rebase --autostash --quiet 2>/dev/null || git pull --rebase --quiet
                    echo "   ✓ Rebased successfully"
                fi
                ;;

            stash_changes)
                echo "→ Stashing dirty changes..."
                STASH_NAME="sync-$(date +%s)"
                git stash push -m "$STASH_NAME" --quiet
                echo "   ✓ Stashed"
                ;;

            skip)
                echo "⏭  Skipping $arg (active PR)"
                ;;

            rebase)
                branch="$arg"
                echo "→ Resetting $branch to $MAIN_BRANCH..."

                if [ "$DRY_RUN" = "1" ]; then
                    echo "   [DRY] Would reset $branch to $MAIN_BRANCH"
                    continue
                fi

                if ! git checkout "$branch" --quiet 2>/dev/null; then
                    echo "   ✗ Checkout failed — skipping"
                    continue
                fi

                git reset --hard "origin/$MAIN_BRANCH"
                echo "   ✓ Reset to $MAIN_BRANCH"
                ;;

            cleanup_deleted)
                echo "→ Cleaning up old branches..."
                local count=0
                while IFS= read -r b; do
                    # Use ++count: ((count++)) exits 1 when old value is 0 under set -e
                    git branch -D "$b" --quiet && echo "   🗑 Deleted $b" && ((++count))
                done < <(git branch --format='%(refname:short)' | grep -- '--to-be-deleted$' || true)
                [ "$count" -gt 0 ] && echo "   ✓ Cleaned $count branch(es)"
                ;;

            restore_stash)
                if git stash list | grep -q "$STASH_NAME"; then
                    echo "→ Restoring stash..."
                    git stash pop --quiet && echo "   ✓ Restored"
                fi
                ;;

            checkout_original)
                echo "→ Returning to $ORIGINAL_BRANCH..."
                git checkout "$ORIGINAL_BRANCH" --quiet
                echo "   ✓ Back on original branch"
                ;;
        esac
    done < "$PLAN_FILE"

    # Optional push
    if [ "$PUSH" = "1" ]; then
        echo ""
        echo "→ Pushing all branches with --force-with-lease..."
        # Empty input: `while read` exits 1 — would trip set -e + pipefail without || true
        git branch --format='%(refname:short)' | grep -vE "^(${MAIN_BRANCH}|legacy)$" | while read -r b; do
            echo "   Pushing $b..."
            git push --force-with-lease origin "$b" --quiet && echo "   ✓ Pushed" || echo "   ⚠ Skipped"
        done || true
    else
        echo ""
        echo "→ Push skipped (use PUSH=1 to push)"
    fi

    echo ""
    echo -e "${C_SUCCESS}╔════════════════════════════════════════════════════════════╗${C_RESET}"
    echo -e "${C_SUCCESS}║ ✓ Sync completed successfully                              ║${C_RESET}"
    echo -e "${C_SUCCESS}╚════════════════════════════════════════════════════════════╝${C_RESET}"
    echo ""
}

# ==================== MAIN ====================
main() {
    echo ""
    echo "  ███████╗██╗   ██╗███╗   ██╗ ██████╗"
    echo "  ██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝"
    echo "  ███████╗ ╚████╔╝ ██╔██╗ ██║██║     "
    echo "  ╚════██║  ╚██╔╝  ██║╚██╗██║██║     "
    echo "  ███████║   ██║   ██║ ╚████║╚██████╗"
    echo "  ╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝"
    echo ""
    echo "sync-branches — Clean One-Color-Per-Phase Synchronizer"
    echo ""

    collect_state
    build_plan
    validate_plan

    if [ "$DRY_RUN" = "1" ]; then
        echo "╔════════════════════════════════════════════════════════════╗"
        echo "║ DRY RUN MODE — No changes will be made                     ║"
        echo "╚════════════════════════════════════════════════════════════╝"
        echo ""
    fi

    sync

    echo "→ Switching back to $ORIGINAL_BRANCH..."
    git checkout "$ORIGINAL_BRANCH" --quiet
    echo "✓ Done"
    echo ""
}

main "$@"
