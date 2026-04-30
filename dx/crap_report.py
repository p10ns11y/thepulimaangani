#!/usr/bin/env python3
"""
Merge cyclomatic complexity (Lizard XML) with line coverage (Rust llvm-cov JSON + Vitest json-summary)
and emit CRAP-style metrics (Agitar formula: CRAP = C^2 * (1-d)^3 + C).

CI: report-only by default — prints Markdown summary; use --max-mean to fail the job.
`--lizard-xml` accepts multiple files (merged). CI currently passes one Rust report; Vitest coverage still feeds TS `d` where paths match.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def crap_score(cyclomatic: float, line_coverage_fraction: float) -> float:
    """Agitar CRAP; C is cyclomatic complexity, d is line coverage in [0,1]."""
    c = max(1.0, float(cyclomatic))
    d = min(1.0, max(0.0, float(line_coverage_fraction)))
    return (c * c) * math.pow(1.0 - d, 3) + c


def norm_path(p: str) -> str:
    return str(Path(p).as_posix())


def load_lizard_xml(path: Path) -> list[tuple[str, float]]:
    """
    Parse Lizard XML (``-o report.xml``): file-level rows with total CCN and function count.
    Returns (file_path, avg_cyclomatic_per_function).
    """
    tree = ET.parse(path)
    root = tree.getroot()
    out: list[tuple[str, float]] = []

    for measure in root.findall("measure"):
        mtype = measure.get("type")
        if mtype != "File":
            continue
        labels = [lab.text for lab in measure.findall("labels/label") if lab.text]
        if "CCN" not in labels or "Functions" not in labels:
            continue
        idx_ccn = labels.index("CCN")
        idx_fn = labels.index("Functions")
        for item in measure.findall("item"):
            name = item.get("name")
            if not name:
                continue
            vals = [float(v.text) for v in item.findall("value") if v.text is not None]
            if len(vals) <= max(idx_ccn, idx_fn):
                continue
            total_ccn = vals[idx_ccn]
            n_fn = max(1.0, vals[idx_fn])
            avg_cc = total_ccn / n_fn
            out.append((norm_path(name), avg_cc))
    return out


def load_rust_llvm_cov_summary(path: Path) -> dict[str, float]:
    """Map file path variants -> line coverage fraction [0,1]."""
    data = json.loads(path.read_text(encoding="utf-8"))
    out: dict[str, float] = {}

    files = data.get("files") if isinstance(data, dict) else None
    if isinstance(files, list):
        for item in files:
            if not isinstance(item, dict):
                continue
            fname = item.get("filename") or item.get("file")
            summ = item.get("summary") or item.get("lines") or {}
            if not fname or not isinstance(summ, dict):
                continue
            count = summ.get("count")
            covered = summ.get("covered")
            frac: float | None = None
            if isinstance(count, (int, float)) and count and isinstance(covered, (int, float)):
                frac = float(covered) / float(count)
            elif "percent" in summ:
                try:
                    frac = float(summ["percent"]) / 100.0
                except (TypeError, ValueError):
                    pass
            if frac is None:
                continue
            nk = norm_path(str(fname))
            out[nk] = frac
            if "tamil-seiyul-alagi/" in nk:
                out[norm_path(nk.split("tamil-seiyul-alagi/", 1)[1])] = frac
    return out


def load_vitest_json_summary(path: Path) -> dict[str, float]:
    """Vitest v8 `coverage-summary.json`: { path: { lines: { pct, ... } } }."""
    data = json.loads(path.read_text(encoding="utf-8"))
    out: dict[str, float] = {}
    if not isinstance(data, dict):
        return out
    for key, block in data.items():
        if key == "total" or not isinstance(block, dict):
            continue
        lines = block.get("lines")
        if isinstance(lines, dict) and "pct" in lines:
            try:
                frac = float(lines["pct"]) / 100.0
            except (TypeError, ValueError):
                continue
            nk = norm_path(key.replace("file://", ""))
            out[nk] = frac
            if "/src/" in nk:
                out[norm_path(nk.split("/src/", 1)[1])] = frac
            out[Path(nk).name] = frac
    return out


def pick_coverage(path: str, rust: dict[str, float], ts: dict[str, float]) -> float:
    n = norm_path(path)
    for m in (rust, ts):
        if n in m:
            return m[n]
        for k, v in m.items():
            if n == k or n.endswith("/" + k) or k.endswith("/" + n):
                return v
    base = Path(n).name
    for m in (rust, ts):
        if base in m:
            return m[base]
    return 0.0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--lizard-xml",
        type=Path,
        nargs="+",
        required=True,
        help="One or more Lizard XML reports (e.g. Rust dir + TS dir separately — mixed trees break -X).",
    )
    ap.add_argument("--rust-cov", type=Path, help="cargo-llvm-cov JSON summary")
    ap.add_argument("--vitest-summary", type=Path, help="Vitest coverage-summary.json")
    ap.add_argument("--out-md", type=Path, default=Path("crap-report.md"))
    ap.add_argument("--max-mean", type=float, default=0.0, help="Fail if mean CRAP > this (0 = off)")
    ap.add_argument("--top", type=int, default=25)
    args = ap.parse_args()

    file_cc: list[tuple[str, float]] = []
    for lx in args.lizard_xml:
        if not lx.exists():
            print(f"WARN: Lizard XML missing, skip: {lx}", file=sys.stderr)
            continue
        try:
            file_cc.extend(load_lizard_xml(lx))
        except ET.ParseError as e:
            print(f"WARN: Invalid Lizard XML {lx}: {e}", file=sys.stderr)
    rust_cov = load_rust_llvm_cov_summary(args.rust_cov) if args.rust_cov and args.rust_cov.exists() else {}
    ts_cov = load_vitest_json_summary(args.vitest_summary) if args.vitest_summary and args.vitest_summary.exists() else {}

    rows: list[tuple[float, str, float, float]] = []
    for fstr, cc in file_cc:
        d = pick_coverage(fstr, rust_cov, ts_cov)
        crap = crap_score(cc, d)
        rows.append((crap, norm_path(fstr), cc, d))

    rows.sort(key=lambda x: -x[0])
    mean_crap = sum(r[0] for r in rows) / len(rows) if rows else 0.0

    lines_out: list[str] = [
        "# CRAP report (CI)",
        "",
        f"Files analyzed (Lizard): **{len(rows)}**",
        f"Rust coverage files matched: **{len(rust_cov)}**",
        f"Frontend coverage files matched: **{len(ts_cov)}**",
        f"Mean CRAP (all scanned files): **{mean_crap:.2f}**",
        "",
        "Per file: `C` = mean cyclomatic complexity (Lizard: total file CCN ÷ function count), "
        "`d` = line coverage fraction from llvm-cov / Vitest.",
        "Formula: `CRAP = C² × (1−d)³ + C`. Files without a coverage match use `d = 0`.",
        "",
        f"## Top {args.top} by CRAP",
        "",
        "| CRAP | Avg CC | cov | File |",
        "| ---:| ---:| ---:| --- |",
    ]
    for crap, path, cc, d in rows[: args.top]:
        lines_out.append(f"| {crap:.1f} | {cc:.2f} | {d * 100:.0f}% | `{path}` |")

    args.out_md.write_text("\n".join(lines_out) + "\n", encoding="utf-8")
    print("\n".join(lines_out))

    if args.max_mean > 0 and mean_crap > args.max_mean:
        print(f"\nERROR: mean CRAP {mean_crap:.2f} exceeds --max-mean {args.max_mean}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
