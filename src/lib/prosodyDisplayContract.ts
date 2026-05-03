/**
 * Contract: how WASM / `ParsedPoem` strings map to visible UI text.
 *
 * **1:1 with parser output (do not rephrase):**
 * - **Foot combined label:** `resolveFootDisplayLabel(foot)` must equal `presentation.feet[g].foot_type`
 *   when that row exists (Rust emits `தமிழ் · latin`).
 * - **Foot Tamil/Latin lines:** When both `display_foot_type_tamil` and `display_foot_type_latin` are set,
 *   `FootTypeCaption` (default variant) shows those strings verbatim (two lines).
 * - **Bond flow (`FootTypeCaption` `tamilOnly`):** Under-word foot labels show **Tamil only** to save space;
 *   Latin transliteration is omitted in that view only (data layer unchanged).
 * - **Bond label (`bondDisplayLabel`):** When `presentation.talai` matches the edge, the UI uses
 *   `talai_type` verbatim — same as `bondDisplayLabel` output.
 *
 * **Intentional non-fidelity (layout / aggregation):**
 * - **TalaiInlineFlow coarse hint** (`linkageCoarseCounts` + `getLinkageTypeDisplay`): summarized counts
 *   per coarse `linkage_type`, not a WASM string — for overview only.
 * - **Bond arrows:** `← label →` and `↓` are chrome around the bond label, not from WASM.
 * - **Line headers:** e.g. `அடி n`, `Line n · …`, English section titles — presentation chrome.
 * - **Fallback maps** in `displayLabels.ts`: only when `presentation` is missing or foot pattern unknown.
 *
 * @see resolveFootDisplayLabel, bondDisplayLabel, FootTypeCaption
 */

export const PROSODY_DISPLAY_CONTRACT_VERSION = 2
