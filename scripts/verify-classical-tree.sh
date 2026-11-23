#!/usr/bin/env bash
# One command for the classical-tree proofs.
# Kani 0.68.0 (toolchain nightly-2026-08-21) and TLA+ tools 1.7.4.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
kani_version="0.68.0"
tla_version="1.7.4"
tla_sha256="936a262061c914694dfd669a543be24573c45d5aa0ff20a8b96b23d01e050e88"
tla_url="https://github.com/tlaplus/tlaplus/releases/download/v${tla_version}/tla2tools.jar"
cache="${root}/tamil-seiyul-alagi/target/verify"
jar="${cache}/tla2tools-${tla_version}.jar"
spec_dir="${root}/tamil-seiyul-alagi/verify"

mkdir -p "${cache}"

if ! command -v java >/dev/null; then
  echo "java is required for TLC" >&2
  exit 1
fi

if [[ ! -f "${jar}" ]] || ! echo "${tla_sha256}  ${jar}" | sha256sum -c - >/dev/null; then
  curl -fsSL -o "${jar}.partial" "${tla_url}"
  echo "${tla_sha256}  ${jar}.partial" | sha256sum -c -
  mv "${jar}.partial" "${jar}"
fi

echo "TLC ${tla_version}: every leaf, named overlaps, agreement when a doubleton is not an overlap"
java -jar "${jar}" -workers 1 -config "${spec_dir}/ClassicalTreeWalk.cfg" "${spec_dir}/ClassicalTreeWalk.tla"

echo "TLC ${tla_version}: unconditional agreement must fail and name one overlap pair"
set +e
java -jar "${jar}" -workers 1 -config "${spec_dir}/ClassicalTreeWalkCounter.cfg" "${spec_dir}/ClassicalTreeWalk.tla"
counter_status=$?
set -e
if [[ "${counter_status}" -eq 0 ]]; then
  echo "unconditional agreement passed; the overlap counterexample disappeared" >&2
  exit 1
fi
echo "unconditional agreement failed, as required (exit ${counter_status})"

if ! command -v cargo-kani >/dev/null && ! cargo kani --version >/dev/null 2>&1; then
  if ! rustup toolchain list | grep -q '^1.88.0'; then
    rustup toolchain install 1.88.0 --profile minimal
  fi
  cargo +1.88.0 install --locked "kani-verifier@${kani_version}"
  cargo kani setup
fi

version_output="$(cargo kani --version 2>&1)"
version_line="${version_output%%$'\n'*}"
if [[ "${version_line}" != *" ${kani_version} "* && "${version_line}" != *" ${kani_version}" ]]; then
  echo "cargo kani is ${version_line}; this script pins ${kani_version}" >&2
  exit 1
fi

echo "Kani ${kani_version}: share gates, tenth rounding, one deterministic leaf"
# classical_tree_does_not_panic_up_to_one_line is not run here. Unwind 40 on
# evaluate_classical_tree unrolls every loop in the tree. CBMC was still
# unwinding that harness after minutes and several GB, so it is not a proof.
cd "${root}/tamil-seiyul-alagi"
cargo kani --harness strict_share_matches_the_integer_comparison \
  --harness tenth_rounding_matches_the_formula_and_the_documented_cases \
  --harness named_share_routes_reject_an_exact_percent \
  --harness walk_is_deterministic_and_returns_at_most_one_leaf
