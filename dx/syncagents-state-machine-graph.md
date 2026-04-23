┌─────────────────────────────────────────────────────────────────────────────┐
│                        DETAILED ARCHITECTURE DIAGRAM                          │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────────────┐
   │                           PHASE 1: COLLECT                           │
   │  • Detect default branch (main/malar) using symbolic-ref             │
   │  • Get current branch + working tree dirty status                    │
   │  • List all local branches (exclude default + legacy)                │
   │  • Fetch active/open PR branches via `gh pr list`                    │
   │  • Store state in memory variables + temp files                      │
   └──────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
   ┌──────────────────────────────────────────────────────────────────────┐
   │                           PHASE 2: BUILD PLAN                        │
   │  • Always add: update_default_branch                                 │
   │  • If dirty → add: stash_changes                                     │
   │  • For every non-PR branch → add: rebase_branch:<name>               │
   │  • Always add: cleanup_deleted_branches                              │
   │  • If dirty → add: restore_stash                                     │
   │  • If not on default → add: checkout_original_branch                 │
   │  • Plan is stored as ordered array of action strings                 │
   └──────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
   ┌──────────────────────────────────────────────────────────────────────┐
   │                           PHASE 3: VALIDATE                          │
   │  • Check remote connectivity with `git ls-remote --heads origin`     │
   │  • Verify working tree is still clean (if not stashed)               │
   │  • Fail fast with clean exit + error message if any issue            │
   └──────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
   ┌──────────────────────────────────────────────────────────────────────┐
   │                            PHASE 4: SYNC                             │
   │  • update_default_branch → git checkout + git pull --rebase          │
   │  • rebase_branch:<name>  → git checkout + git rebase -X ours         │
   │                            (fallback: rename + recreate from main)   │
   │  • cleanup_deleted       → delete all *--to-be-deleted branches      │
   │  • Optional (PUSH=1)     → git push --force-with-lease for all       │
   │  • restore_stash         → git stash pop                             │
   │  • checkout_original     → return to the branch you started on       │
   └──────────────────────────────────────────────────────────────────────┘

Key Design Principles:
  • Only active PR branches are skipped
  • All other branches are rebased with `-X ours` strategy
  • Uses file-based plan storage for reliability
  • Vibrant glowing colors for excellent terminal experience
  • Clean separation of concerns (Collect → Plan → Validate → Sync)