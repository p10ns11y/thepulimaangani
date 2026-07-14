# tamil-time

Reusable **Tamil Nadu cultural time & calendar** model: Tinai × Perum × Siru × Nazhigai × Jaamam (saamam).

Ported from arch-machine eye-comfort `tamil_schedule.py` so the calendar logic can live outside Omarchy/theme hosts. Eye-comfort (and later Waybar / WASM / CLI) can consume this crate via path dep, FFI, or a thin Python wrapper.

## Domain (design grid, not live astronomy)

| Layer | Meaning |
|-------|---------|
| **Tinai** | Five landscapes (kurinji, mullai, marutham, neythal, palai) |
| **Perum** | Six seasons (~mid-month Gregorian windows) |
| **Siru** | Six ~4 h watches (vidiyal 02–06 … yaamam 22–02) |
| **Nazhigai** | Soft steps 0–9 within Siru (~24 min each) |
| **Jaamam** | Eight × 3 h from vidiyal epoch; each Siru overlaps as 7.5+2.5 / 5+5 / 2.5+7.5 |

Term **jaamam** ≡ saamam; distinct from Siru **yaamam**.

## Usage

```rust
use chrono::NaiveDate;
use tamil_time::{resolve_tamil_at, ResolveInput, Siru};

fn main() {
    let state = resolve_tamil_at(
        &ResolveInput {
            tinai: Some("marutham".into()),
            siru: Some("vidiyal".into()),
            nazhigai: Some(0),
            ..Default::default()
        },
        NaiveDate::from_ymd_opt(2026, 7, 14).unwrap(),
        3,
        0,
    )
    .unwrap();

    assert_eq!(state.siru, Siru::Vidiyal);
    println!("{}", state.scene);
    // plains · marutham · vidiyal · jaamam 1 (full) + jaamam 2 (2.5 nazhigai) ·
    // nazhigai 0 (≈0×24 min ≈ 0 min elapsed) · mudhu venil
}
```

Resolve “now” with `resolve_tamil(&ResolveInput::default())` (uses local clock via `chrono`).

## Public API sketch

- Types: `Tinai`, `Perum`, `Siru`, `CircadianPhase`, `JaamamPart`, `JaamamDetail`, `TamilState`
- Clock: `perum_for_date`, `siru_for_hour`, `nazhigai_in_siru`, `nazhigai_of_day`
- Jaamam: `jaamam_window`, `jaamam_index_at`, `jaamam_split_for_siru`, `jaamam_detail_for`
- Resolve: `resolve_tamil`, `resolve_tamil_at`, `ResolveInput`
- Display: `scene_line`, `wallpaper_hint`, `wallpaper_fallback_names`, labels/meta
- Parse: `parse_tinai`, `parse_perum`, `parse_siru`

Host theme ids default to `eye-comfort-tn-{tinai}` (`DEFAULT_THEME_PREFIX`); override with `ResolveInput.theme_prefix`.

## Dependencies

- `chrono` (clock + std only) — local “now” and `NaiveDate`
- `thiserror` — parse/resolve errors

No Omarchy, no UI, no palette.

## Test

```bash
cd tamil-time && cargo test
```

## Future consumers

- arch-machine `modules/productivity/eye-comfort` may later call this crate (path/FFI) instead of duplicating Python
- Thepulimaangani web/WASM can share the same calendar vocabulary without dragging theme code
