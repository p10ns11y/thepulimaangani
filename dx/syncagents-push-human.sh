#!/usr/bin/env bash
#
# syncagents-push-human.sh — Human-gated branch push after sync
#
# Policy (post–PR review): `./dx/syncagents.sh` alone resets local branches to
# origin/malar but does NOT push. Force-pushing many branch tips is a
# destructive, trust-sensitive operation — run it only from a human-controlled
# environment, not from unattended agent sessions.
#
# Usage (interactive):
#   ./dx/syncagents-push-human.sh
#
# Usage (creator / CI you own — non-interactive):
#   HUMAN_SYNC_ACK=YES_I_AM_HUMAN ./dx/syncagents-push-human.sh
#
# Coding agents: do NOT set HUMAN_SYNC_ACK or pipe "yes" into this script.
# If you need remotes updated, ask the human maintainer to run this file.
#

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SYNC_SCRIPT="${ROOT}/dx/syncagents.sh"

if [[ ! -x "$SYNC_SCRIPT" ]] && [[ ! -f "$SYNC_SCRIPT" ]]; then
	echo "error: missing $SYNC_SCRIPT" >&2
	exit 1
fi

if [[ "${HUMAN_SYNC_ACK:-}" == "YES_I_AM_HUMAN" ]]; then
	export PUSH=1
	exec bash "$SYNC_SCRIPT"
fi

if [[ ! -t 0 ]]; then
	cat >&2 <<'EOF'
Refusing non-interactive run without HUMAN_SYNC_ACK.

This script force-pushes local branch tips after syncing to malar. That must
not run from a headless agent unless a human explicitly exports:

  HUMAN_SYNC_ACK=YES_I_AM_HUMAN

Do not add that export to agent rules, CI secrets, or shared env files.
EOF
	exit 2
fi

cat <<'EOF'
╔════════════════════════════════════════════════════════════════════╗
║  HUMAN SYNC — branch push after ./dx/syncagents.sh                 ║
╠════════════════════════════════════════════════════════════════════╣
║  Next step runs:  PUSH=1 ./dx/syncagents.sh                          ║
║  That force-pushes every local branch (except malar/legacy) to     ║
║  origin with --force-with-lease. Open PR heads are skipped.        ║
║                                                                    ║
║  Coding agents: run ./dx/syncagents.sh only (no PUSH).            ║
╚════════════════════════════════════════════════════════════════════╝
EOF

read -r -p "Type YES (all caps) to continue with push: " reply
if [[ "$reply" != "YES" ]]; then
	echo "Aborted (no push)."
	exit 1
fi

export PUSH=1
exec bash "$SYNC_SCRIPT"
