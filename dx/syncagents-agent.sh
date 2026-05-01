#!/usr/bin/env bash
#
# syncagents-agent.sh — Agent-safe sync entry point
#
# Runs the same state machine as dx/syncagents.sh but:
#   - Sets SYNCAGENTS_SKIP_REMOTE_TRACKING=1 — does NOT create local branches for every
#     origin/* ref (avoids surprising new locals + resets on a minimal clone).
#
# You may set PUSH=1 when your environment only has the agent's working branch (or a small
# allowlisted set) checked out and push credentials cannot reach unrelated remotes — that
# is an org policy / credential setup, not something this script enforces.
#
# For full power (remote tracking locals + optional push with human gate), use:
#   ./dx/syncagents-push-human.sh
#

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export SYNCAGENTS_SKIP_REMOTE_TRACKING=1
exec bash "${ROOT}/dx/syncagents.sh" "$@"
