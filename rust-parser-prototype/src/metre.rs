use crate::types::*;

// Get the overall metre type
pub fn get_metre_type(
    lines: &[Line],
    total_bonds: usize,
    kali_bonds: usize,
    ven_bonds: usize,
) -> String {
    // Check for single-line venpaa first
    if lines.len() == 1 && lines[0].feet.len() >= 3 {
        if let Some(metre) = check_single_line_venpaa(&lines[0]) {
            return metre;
        }
    }

    // Check kaliviruttam before venpaa since it has more specific requirements
    if let Some(metre) = check_kaliviruttam(lines, total_bonds, kali_bonds, ven_bonds) {
        return metre;
    }

    if let Some(metre) = check_asiriyappaa(lines, total_bonds, kali_bonds, ven_bonds) {
        return metre;
    }
    if let Some(metre) = check_venkalippaa(lines, total_bonds, kali_bonds, ven_bonds) {
        return metre;
    }
    if let Some(metre) = check_kalippaa(lines, total_bonds, kali_bonds, ven_bonds) {
        return metre;
    }
    if let Some(metre) = check_venpaavinam(lines, total_bonds) {
        return metre;
    }
    if let Some(metre) = check_venpaa_multiline(lines) {
        return metre;
    }
    if let Some(metre) = check_asiriyappaa(lines, total_bonds, kali_bonds, ven_bonds) {
        return metre;
    }
    if let Some(metre) = check_kalippaa(lines, total_bonds, kali_bonds, ven_bonds) {
        return metre;
    }
    if let Some(metre) = check_venkalippaa(lines, total_bonds, kali_bonds, ven_bonds) {
        return metre;
    }
    // TODO: add more checks like Vanjippaa, etc.
    "Unknown".to_string()
}

// Check single line venpaa
fn check_single_line_venpaa(line: &Line) -> Option<String> {
    if check_venpaa(&line.feet) {
        Some("வெண்பா (Venpaa)".to_string())
    } else {
        None
    }
}

// Check if Venpaa (simplified)
pub fn check_venpaa(feet: &[Foot]) -> bool {
    // Venpaa typically has 4 feet in first line, 3 in last line
    // For now, just check if we have feet and they are of allowed types
    let allowed_types = [
        "tEmA",
        "puLimA",
        "kUviLa_m",
        "karuviLa_m",
        "tEmA_GkA_y",
        "puLimA_GkA_y",
        "kUviLa_GkA_y",
        "karuviLa_GkA_y",
    ];

    for foot in feet {
        if !allowed_types.contains(&foot.foot_type.as_str()) {
            return false;
        }
    }

    true
}

// Check if Venpaa (simplified)
pub fn check_venpaa_multiline(lines: &[Line]) -> Option<String> {
    // Basic venpaa: 4 lines, each with 3 or 4 feet
    if lines.len() != 4 {
        return None;
    }

    for line in lines {
        if line.feet.len() < 3 || line.feet.len() > 4 {
            return None;
        }
    }

    Some("வெண்பா (Venpaa)".to_string())
}

// Check if Venpaavinam
pub fn check_venpaavinam(lines: &[Line], total_bonds: usize) -> Option<String> {
    // Multi-line Venbaa typically has 2 lines with 4 + 3 feet pattern
    if lines.len() != 2 {
        return None;
    }

    let foot_counts: Vec<usize> = lines.iter().map(|l| l.feet.len()).collect();
    if foot_counts != [4, 3] {
        return None;
    }

    // For Venpaavinam, we allow some "unknown" feet as they might be complex valid patterns
    // that our current foot type mapping doesn't cover yet
    let unknown_count = lines
        .iter()
        .flat_map(|line| &line.feet)
        .filter(|foot| foot.foot_type == "unknown")
        .count();

    // Allow up to 2 unknown feet (to be more permissive during development)
    if unknown_count > 2 {
        return None;
    }

    // Basic bonding check
    if total_bonds > 0 {
        Some("வெண்பா (Venpaa)".to_string())
    } else {
        None
    }
}

// Check if Kaliviruttam
pub fn check_kaliviruttam(
    lines: &[Line],
    total_bonds: usize,
    kali_bonds: usize,
    ven_bonds: usize,
) -> Option<String> {
    // Kaliviruttam typically has 4 lines with 4 feet each (4×4 pattern)
    if lines.len() != 4 {
        return None;
    }

    // Each line must have exactly 4 feet
    for line in lines {
        if line.feet.len() != 4 {
            return None;
        }
    }

    // Allow some "unknown" feet for complex patterns (up to 6 total for kaliviruttam)
    let unknown_count = lines
        .iter()
        .flat_map(|line| &line.feet)
        .filter(|foot| foot.foot_type == "unknown")
        .count();

    if unknown_count > 6 {
        return None;
    }

    // Kaliviruttam requires some bonding but is more flexible than asiriyappaa
    if total_bonds > 0 {
        Some("kaliviru_tta_m".to_string())
    } else {
        None
    }
}

// Check if Venkalippaa
pub fn check_venkalippaa(
    lines: &[Line],
    total_bonds: usize,
    kali_bonds: usize,
    ven_bonds: usize,
) -> Option<String> {
    // Venkalippaa: typically 4 lines with 4-4-4-3 foot pattern
    if lines.len() != 4 {
        return None;
    }

    // Check foot counts per line
    let mut line_class_check = true;
    let final_line_index = lines.len() - 1;
    for (i, line) in lines.iter().enumerate() {
        if i < final_line_index {
            // Non-final lines must have exactly 4 feet
            if line.feet.len() != 4 {
                line_class_check = false;
            }
        } else {
            // Final line must have exactly 3 feet
            if line.feet.len() != 3 {
                return None;
            }
        }
    }

    // Talai check: ≥50% kali+ven bonds, ≥25% kali bonds
    let talai_check = if total_bonds > 0 {
        let combined = kali_bonds + ven_bonds;
        (combined as f64 / total_bonds as f64) > 0.5
            && (kali_bonds as f64 / total_bonds as f64) > 0.25
    } else {
        false
    };

    if line_class_check && talai_check {
        Some("ve_Nkali_ppA".to_string())
    } else {
        None
    }
}

// Check if Asiriyappaa
pub fn check_asiriyappaa(
    lines: &[Line],
    total_bonds: usize,
    kali_bonds: usize,
    ven_bonds: usize,
) -> Option<String> {
    // Asiriyappaa: typically 4 lines with 4 feet each, strict bonding requirements
    if lines.len() != 4 {
        return None;
    }

    // Each line must have exactly 4 feet
    for line in lines {
        if line.feet.len() != 4 {
            return None;
        }
    }

    // Talai check: Asiriyappaa requires strict bonding
    // Typically ≥60% bonded feet with good kali/ven distribution
    let talai_check = if total_bonds > 0 {
        let combined = kali_bonds + ven_bonds;
        (combined as f64 / total_bonds as f64) > 0.6 && kali_bonds >= ven_bonds // More kali than ven bonds
    } else {
        false
    };

    if talai_check {
        Some("Aciriya_ppA".to_string())
    } else {
        None
    }
}

// Check if Kalippaa
pub fn check_kalippaa(
    lines: &[Line],
    total_bonds: usize,
    kali_bonds: usize,
    ven_bonds: usize,
) -> Option<String> {
    // Kalippaa: typically longer forms with specific patterns
    if lines.len() < 4 {
        return None;
    }

    // Kalippaa requires good bonding but less strict than asiriyappaa
    let talai_check = if total_bonds > 0 {
        let combined = kali_bonds + ven_bonds;
        // Kalippaa allows more flexible bonding than asiriyappaa
        (combined as f64 / total_bonds as f64) > 0.5
    } else {
        false
    };

    if talai_check {
        Some("kali_ppA".to_string())
    } else {
        None
    }
}
