use crate::types::*;

// Calculate talai (bonds/linkages) between feet
pub fn calculate_talai(lines: &[Line]) -> (usize, usize, usize) {
    let mut total_bonds = 0;
    let mut kali_bonds = 0;
    let mut ven_bonds = 0;

    for line in lines {
        for window in line.feet.windows(2) {
            total_bonds += 1;
            let prev_foot = &window[0];
            let curr_foot = &window[1];

            let bond_type = get_bond_type(
                &prev_foot.foot_type,
                curr_foot
                    .syllables
                    .first()
                    .map(|s| s.syllable_type.clone())
                    .unwrap_or(SyllableType::Ner),
            );

            if bond_type.contains("கலித்தளை") {
                kali_bonds += 1;
            }
            if bond_type.contains("வெண்டளை") {
                ven_bonds += 1;
            }
        }
    }

    (total_bonds, kali_bonds, ven_bonds)
}

// Get bond type between two feet
pub fn get_bond_type(prev_foot_type: &str, next_syllable_type: SyllableType) -> String {
    let next_syl = match next_syllable_type {
        SyllableType::Ner => "nE_r",
        SyllableType::Nirai => "nirY",
    };

    // Based on PHP logic, using contains instead of ends_with for kA_y and pU
    if prev_foot_type.contains("mA") && next_syl == "nE_r" {
        "நேரொன்றிய ஆசிரியத்தளை".to_string()
    } else if prev_foot_type.contains("viLa_m") && next_syl == "nirY" {
        "நிரையொன்றிய ஆசிரியத்தளை".to_string()
    } else if (prev_foot_type.contains("mA") && next_syl == "nirY")
        || (prev_foot_type.contains("viLa_m") && next_syl == "nE_r")
    {
        "இயற்சீர் வெண்டளை".to_string()
    } else if (prev_foot_type.contains("pU") || prev_foot_type.contains("kA_y"))
        && next_syl == "nE_r"
    {
        "வெண்சீர் வெண்டளை".to_string()
    } else if (prev_foot_type.contains("NiZa_l")
        || prev_foot_type.contains("niZa_l")
        || prev_foot_type.contains("kaVi"))
        && next_syl == "nirY"
    {
        "ஒன்றிய வஞ்சித்தளை".to_string()
    } else if (prev_foot_type.contains("NiZa_l")
        || prev_foot_type.contains("niZa_l")
        || prev_foot_type.contains("kaVi"))
        && next_syl == "nE_r"
    {
        "ஒன்றா வஞ்சித்தளை".to_string()
    } else if (prev_foot_type.contains("pU") || prev_foot_type.contains("kA_y"))
        && next_syl == "nirY"
    {
        "கலித்தளை".to_string()
    } else {
        "unknown".to_string()
    }
}
