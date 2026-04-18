use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

// ==================== CORE TYPES (mirrors PHP ProsodyParseTree) ====================

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum SyllableType {
    Ner,   // நேர்
    Nirai, // நிரை
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Syllable {
    pub text: String,
    pub syllable_type: SyllableType,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Foot {
    pub syllables: Vec<Syllable>,
    pub foot_type: String, // e.g. "tEmA", "puLimA", "mA", etc. (from original WordType)
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Line {
    pub feet: Vec<Foot>,
    pub line_class: String, // kuRaLaTi, ci_ntaTi, etc.
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LetterCount {
    pub vowel: usize,
    pub consonant: usize,
    pub consonant_vowel: usize,
    pub aytham: usize,
    pub short: usize,
    pub long: usize,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ParseResult {
    pub original_text: String,
    pub lines: Vec<Line>,
    pub metre_type: String,
    pub letter_count: LetterCount,
    pub vikalpa_count: usize,
    pub word_bond: String, // talai linkages (will expand later)
    pub errors: Vec<String>,
}

// ==================== REFERENCE DATA (ported directly from PHP) ====================

const SYLLABLE_TYPES: [&str; 2] = ["nE_r", "nirY"];

const WORD_TYPES: [(&str, &str); 6] = [
    ("nE_rnE_r", "tEmA"),
    ("nirYnE_r", "puLimA"),
    ("nE_rnirY", "kUviLa_m"),
    ("nirYnirY", "karuviLa_m"),
    // ... (full list from original PHP — I included the most common ones; we’ll expand as needed)
    ("nE_r", "mA"),
    ("nirY", "viLa_m"),
    // Add the rest of the 3-asai, 4-asai, etc. from the original WordType array here
];

const VENPAA_WORD_CLASS: [(&str, &str); 4] = [
    ("nE_r", "nA_L"),
    ("nirY", "mala_r"),
    ("nE_rpu", "kAcu"),
    ("nirYpu", "piRa_ppu"),
];

// Foot classification map (WordType from PHP)
fn get_word_type(pattern: &str) -> &'static str {
    match pattern {
        "nE_rnE_r" => "tEmA",
        "nirYnE_r" => "puLimA",
        "nE_rnirY" => "kUviLa_m",
        "nirYnirY" => "karuviLa_m",
        "nE_rnE_rnE_r" => "tEmA_GkA_y",
        "nirYnE_rnE_r" => "puLimA_GkA_y",
        "nE_rnirYnE_r" => "kUviLa_GkA_y",
        "nirYnirYnE_r" => "karuviLa_GkA_y",
        "nE_rnE_rnirY" => "tEmA_GkaVi",
        "nirYnE_rnirY" => "puLimA_GkaVi",
        "nE_rnirYnirY" => "kUviLa_GkaVi",
        "nirYnirYnirY" => "karuviLa_GkaVi",
        "nE_rnE_rnE_rnE_r" => "tEmA_nta_NpU",
        "nirYnE_rnE_rnE_r" => "puLimA_nta_NpU",
        "nE_rnirYnE_rnE_r" => "kUviLa_nta_NpU",
        "nirYnirYnE_rnE_r" => "karuviLa_nta_NpU",
        "nE_rnE_rnirYnE_r" => "tEmAnaRu_mpU",
        "nirYnE_rnirYnE_r" => "puLimAnaRu_mpU",
        "nE_rnirYnirYnE_r" => "kUviLanaRu_mpU",
        "nirYnirYnirYnE_r" => "karuviLanaRu_mpU",
        "nE_rnE_rnirYnirY" => "tEmAnaRuniZa_l",
        "nirYnE_rnirYnirY" => "puLimAnaRuniZa_l",
        "nE_rnirYnirYnirY" => "kUviLanaRuniZa_l",
        "nirYnirYnirYnirY" => "karuviLanaRuniZa_l",
        "nE_rnE_rnE_rnirY" => "tEmA_nta_NNiZa_l",
        "nirYnE_rnE_rnirY" => "puLimA_nta_NNiZa_l",
        "nE_rnirYnE_rnirY" => "kUviLa_nta_NNiZa_l",
        "nirYnirYnE_rnirY" => "karuviLa_nta_NNiZa_l",
        "nE_r" => "mA",
        "nirY" => "viLa_m",
        _ => "unknown",
    }
}

// ==================== WASM ENTRY POINT ====================

fn get_letter_count(text: &str) -> LetterCount {
    let tamil_text = text.trim();

    // Tamil vowel characters
    let vowels = ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ"];
    let vowel_signs = ["ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"];
    let a_mey = [
        "க", "ங", "ச", "ஜ", "ஞ", "ட", "ண", "த", "ந", "ன", "ப", "ம", "ய", "ர", "ற", "ல", "ள", "ழ",
        "வ", "ஶ", "ஷ", "ஸ", "ஹ",
    ];

    let mut vowel_count = 0;
    let mut consonant_count = 0;
    let mut aytham_count = 0;
    let mut a_mey_count = 0;

    // Count vowels
    for vowel in &vowels {
        vowel_count += tamil_text.matches(vowel).count();
    }

    // Count consonant markers (்)
    consonant_count = tamil_text.matches("்").count();

    // Count aytham (ஃ)
    aytham_count = tamil_text.matches("ஃ").count();

    // Count A Mey (consonants)
    for mey in &a_mey {
        a_mey_count += tamil_text.matches(mey).count();
    }

    let consonant_vowel_count = a_mey_count - consonant_count;

    // For short/long counting, we need romanized version
    // For now, use basic heuristic: count based on vowel types
    let mut short_count = 0;
    let mut long_count = 0;

    // Simple heuristic: short vowels are அ, இ, உ, எ, ஒ
    let short_vowels = ["அ", "இ", "உ", "எ", "ஒ"];
    let long_vowels = ["ஆ", "ஈ", "ஊ", "ஏ", "ஐ", "ஓ", "ஔ"];

    for sv in &short_vowels {
        short_count += tamil_text.matches(sv).count();
    }

    for lv in &long_vowels {
        long_count += tamil_text.matches(lv).count();
    }

    // Count vowel signs as additional
    for sign in &vowel_signs {
        let count = tamil_text.matches(sign).count();
        // Vowel signs are generally long, but this is simplified
        long_count += count;
    }

    LetterCount {
        vowel: vowel_count,
        consonant: consonant_count,
        consonant_vowel: consonant_vowel_count,
        aytham: aytham_count,
        short: short_count,
        long: long_count,
    }
}

#[wasm_bindgen]
pub fn parse_poem(tamil_text: &str) -> String {
    // Basic preprocessing
    let cleaned = tamil_text.trim().to_string();

    let letter_count_struct = get_letter_count(&cleaned);

    // Parse lines and feet
    let lines = parse_lines(&cleaned);

    // Calculate talai (bonds)
    let (total_bonds, kali_bonds, ven_bonds) = calculate_talai(&lines);
    let word_bond = format!(
        "Total bonds: {}, Kali: {}, Ven: {}",
        total_bonds, kali_bonds, ven_bonds
    );

    // Determine metre type
    let metre_type = get_metre_type(&lines, total_bonds, kali_bonds, ven_bonds);

    let result = ParseResult {
        original_text: cleaned.clone(),
        lines,
        metre_type,
        letter_count: letter_count_struct,
        vikalpa_count: 0,
        word_bond,
        errors: vec![],
    };

    serde_json::to_string(&result).unwrap()
}

// Tamil to Romanized transliteration (based on PHP tam2lat)
fn tamil_to_romanized(text: &str) -> String {
    let mut tameng: HashMap<&str, &str> = HashMap::new();
    tameng.insert("அ", "_a");
    tameng.insert("ஆ", "_A");
    tameng.insert("இ", "_i");
    tameng.insert("ஈ", "_I");
    tameng.insert("உ", "_u");
    tameng.insert("ஊ", "_U");
    tameng.insert("எ", "_e");
    tameng.insert("ஏ", "_E");
    tameng.insert("ஐ", "_Y");
    tameng.insert("ஒ", "_o");
    tameng.insert("ஓ", "_O");
    tameng.insert("ஔ", "_W");
    tameng.insert("க", "k");
    tameng.insert("ங", "G");
    tameng.insert("ச", "c");
    tameng.insert("ஜ", "j");
    tameng.insert("ஞ", "J");
    tameng.insert("ட", "T");
    tameng.insert("ண", "N");
    tameng.insert("த", "t");
    tameng.insert("ந", "n");
    tameng.insert("ன", "V");
    tameng.insert("ப", "p");
    tameng.insert("ம", "m");
    tameng.insert("ய", "y");
    tameng.insert("ர", "r");
    tameng.insert("ற", "R");
    tameng.insert("ல", "l");
    tameng.insert("ள", "L");
    tameng.insert("ழ", "Z");
    tameng.insert("வ", "v");
    tameng.insert("ஶ", "F");
    tameng.insert("ஷ", "S");
    tameng.insert("ஸ", "s");
    tameng.insert("ஹ", "h");
    tameng.insert("ா", "A");
    tameng.insert("ி", "i");
    tameng.insert("ீ", "I");
    tameng.insert("ு", "u");
    tameng.insert("ூ", "U");
    tameng.insert("ெ", "e");
    tameng.insert("ே", "E");
    tameng.insert("ை", "Y");
    tameng.insert("ொ", "o");
    tameng.insert("ோ", "O");
    tameng.insert("ௌ", "W");
    tameng.insert("ஃ", "_K");

    let mut result = text.to_string();

    // Replace consonant + virama with consonant
    let re = Regex::new(r"_([kGcJTNtnpmyrlvZLRVjSsh])").unwrap();
    result = re.replace_all(&result, "$1்").to_string();

    // Replace characters
    for (tamil, roman) in &tameng {
        result = result.replace(tamil, roman);
    }

    // Special replacements
    result = result.replace("a", "").replace("B", "ௌ").replace("Q", "ை");
    result = result.replace("_", "");

    result
}

// Basic syllable detection (simplified version of PHP GetTextSyllablePattern)
fn detect_syllables(text: &str) -> Vec<(String, SyllableType)> {
    let romanized = tamil_to_romanized(text);

    let mut syllables = Vec::new();

    // Simple regex for ner: consonant? + long/short vowel + optional consonant
    let ner_re =
        Regex::new(r"[kGcJTNtnpmyrlvZLRVjSsh]?_?[aAiIuUeEoOQYBW](_[KkGcJTNtnpmyrlvZLRVjSsh])?")
            .unwrap();

    // Simple regex for nirai: CV + CV + optional C
    let nirai_re = Regex::new(r"([kGcJTNtnpmyrlvZLRVjSsh]?_?[aiueoBQ])([kGcJTNtnpmyrlvZLRVjSsh][aAiIuUeEoOYWBQ])(_[KkGcJTNtnpmyrlvZLRVjSsh])?").unwrap();

    let words: Vec<&str> = romanized.split_whitespace().collect();

    for word in words {
        // First try nirai patterns
        for cap in nirai_re.captures_iter(word) {
            if let Some(m) = cap.get(0) {
                syllables.push((m.as_str().to_string(), SyllableType::Nirai));
            }
        }

        // Then try ner patterns on remaining text
        let mut remaining = word.to_string();
        for syl in &syllables {
            remaining = remaining.replace(&syl.0, "");
        }

        for cap in ner_re.captures_iter(&remaining) {
            if let Some(m) = cap.get(0) {
                syllables.push((m.as_str().to_string(), SyllableType::Ner));
            }
        }
    }

    syllables
}

// Basic metre validation (simplified CheckVenpaa)
fn check_venpaa(feet: &[Foot]) -> bool {
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

// Parse lines from text
fn parse_lines(text: &str) -> Vec<Line> {
    let mut lines = Vec::new();

    for line_text in text.split('\n') {
        let cleaned_line = remove_punctuation(line_text.trim());
        if cleaned_line.is_empty() {
            continue;
        }

        let mut feet = Vec::new();

        for word in cleaned_line.split_whitespace() {
            let detected_syllables = detect_syllables(word);
            if detected_syllables.is_empty() {
                continue;
            }

            let syllables: Vec<Syllable> = detected_syllables
                .into_iter()
                .map(|(text, syl_type)| Syllable {
                    text,
                    syllable_type: syl_type,
                })
                .collect();

            let pattern = syllables
                .iter()
                .map(|s| match s.syllable_type {
                    SyllableType::Ner => "nE_r",
                    SyllableType::Nirai => "nirY",
                })
                .collect::<Vec<_>>()
                .join("");

            let foot_type = get_word_type(&pattern);

            let foot = Foot {
                syllables,
                foot_type: foot_type.to_string(),
            };

            feet.push(foot);
        }

        let line = Line {
            feet,
            line_class: "kuRaLaTi".to_string(), // TODO: determine line class
        };

        lines.push(line);
    }

    lines
}

// Remove punctuation from text (simplified)
fn remove_punctuation(text: &str) -> String {
    text.chars()
        .filter(|c| !c.is_ascii_punctuation() && *c != '।' && *c != '॥') // Add Tamil punctuation if needed
        .collect()
}

// Calculate talai (bonds/linkages) between feet
fn calculate_talai(lines: &[Line]) -> (usize, usize, usize) {
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
fn get_bond_type(prev_foot_type: &str, next_syllable_type: SyllableType) -> String {
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

// Simplified bond detection (placeholder - need proper implementation)
fn is_kali_bond(_prev: &str, _curr: &str) -> bool {
    // TODO: implement based on PHP logic
    false
}

fn is_ven_bond(_prev: &str, _curr: &str) -> bool {
    // TODO: implement based on PHP logic
    false
}

// Get metre type by checking in priority order
fn get_metre_type(
    lines: &[Line],
    total_bonds: usize,
    kali_bonds: usize,
    ven_bonds: usize,
) -> String {
    if let Some(metre) = check_venpaa_multiline(lines) {
        return metre;
    }
    // TODO: add other checks like check_asiriyappaa, etc.
    if let Some(metre) = check_venkalippaa(lines, total_bonds, kali_bonds, ven_bonds) {
        return metre;
    }
    // TODO: add more checks
    "Unknown".to_string()
}

// Check if Venpaa (simplified)
fn check_venpaa_multiline(lines: &[Line]) -> Option<String> {
    if lines.len() != 1 {
        return None;
    }
    let line = &lines[0];
    if check_venpaa(&line.feet) {
        Some("வெண்பா (Venpaa)".to_string())
    } else {
        None
    }
}

// Check if Venkalippaa
fn check_venkalippaa(
    lines: &[Line],
    total_bonds: usize,
    kali_bonds: usize,
    ven_bonds: usize,
) -> Option<String> {
    // Must have more than 3 lines
    if lines.len() <= 3 {
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

    // Check disallowed foot types (no tEmA, puLimA, karuviLa_GkaVi, kUviLa_GkaVi) only in non-final lines
    let disallowed = ["tEmA", "puLimA", "karuviLa_GkaVi", "kUviLa_GkaVi"];
    let mut word_class_check = true;
    for (i, line) in lines.iter().enumerate() {
        if i < final_line_index {
            for foot in &line.feet {
                if disallowed.contains(&foot.foot_type.as_str()) {
                    word_class_check = false;
                }
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

    if line_class_check && word_class_check && talai_check {
        Some("ve_Nkali_ppA".to_string())
    } else {
        None
    }
}

// ==================== FUTURE EXPANSION POINTS (already planned) ====================
// - GetLetterCount() → letter-by-letter Tamil analysis
// - GetTextSyllablePattern() → ner/nirai + feet
// - CheckVenpaa(), CheckAsiriyappa(), etc.
// - Full talai (bond) calculation
