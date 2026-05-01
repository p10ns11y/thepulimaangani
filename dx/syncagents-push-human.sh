#!/usr/bin/env bash
#
# syncagents-push-human.sh — Human-only full sync (remote tracking + gated push)
#
# Runs dx/syncagents.sh once with DEFAULT behaviour (creates missing local branches
# tracking origin/* so remote-only persona branches get reset to malar too).
# PUSH is set per run: 0 for sync-only, 1 to also force-with-lease local branch tips.
#
# Coding agents: use ./dx/syncagents-agent.sh instead. Do NOT set HUMAN_SYNC_ACK.
#

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SYNC_SCRIPT="${ROOT}/dx/syncagents.sh"

if [[ ! -f "$SYNC_SCRIPT" ]]; then
	echo "error: missing $SYNC_SCRIPT" >&2
	exit 1
fi

# Full power: ensure every origin/* can get a local tracking branch before sync.
unset SYNCAGENTS_SKIP_REMOTE_TRACKING

run_sync() {
	local push_val="$1"
	( export PUSH="$push_val"; exec bash "$SYNC_SCRIPT" )
}

if [[ "${HUMAN_SYNC_ACK:-}" == "YES_I_AM_HUMAN" ]]; then
	if [[ "${HUMAN_SYNC_PUSH:-1}" == "1" ]]; then
		run_sync 1
	else
		run_sync 0
	fi
	exit 0
fi

if [[ ! -t 0 ]]; then
	cat >&2 <<'EOF'
Refusing non-interactive run without HUMAN_SYNC_ACK.

Full sync (remote tracking locals) + optional force-push must not run headless
unless a human exports:

  HUMAN_SYNC_ACK=YES_I_AM_HUMAN

Optional: HUMAN_SYNC_PUSH=0 to only run sync (tracking + reset) without push.

Do not add HUMAN_SYNC_ACK to agent rules or shared env files.
EOF
	exit 2
fi

cat <<'EOF'
╔════════════════════════════════════════════════════════════════════╗
║  HUMAN FULL SYNC — dx/syncagents.sh (remote tracking ON)          ║
╠════════════════════════════════════════════════════════════════════╣
║  One run: fetch, ensure origin/* locals, reset locals to malar,   ║
║  then optionally force-with-lease (if you choose PUSH below).      ║
║                                                                    ║
║  Only run when no agents rely on local-only state you care about. ║
╚════════════════════════════════════════════════════════════════════╝
EOF

read -r -p "Type YES (all caps) to continue: " reply
if [[ "$reply" != "YES" ]]; then
	echo "Aborted."
	exit 1
fi

read -r -p "Type PUSH (all caps) to include force-push, or NO for sync only: " reply2
if [[ "$reply2" == "PUSH" ]]; then
	run_sync 1
else
	run_sync 0
fi
