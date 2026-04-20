// Tamil Character Set - Complete 247 Characters
// Production-ready version with WebAssembly bindings for thepulimaangani

use wasm_bindgen::prelude::*;

pub const VOWELS: [&str; 12] = [
    "அ", "ஆ", "இ", "ஈ", "உ", "ஊ",
    "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ",
];

pub const PURE_CONSONANTS: [&str; 18] = [
    "க்", "ங்", "ச்", "ஞ்", "ட்", "ண்",
    "த்", "ந்", "ப்", "ம்", "ய்", "ர்",
    "ல்", "வ்", "ழ்", "ள்", "ற்", "ன்",
];

pub const AYTHAM: &str = "ஃ";

const VOWEL_SIGNS: [&str; 12] = [
    "", "ா", "ி", "ீ", "ு", "ூ",
    "ெ", "ே", "ை", "ொ", "ோ", "ௌ",
];

/// Generates the full 12×18 Uyirmei matrix
#[wasm_bindgen]
pub fn generate_uyirmei_matrix() -> Vec<Vec<String>> {
    let mut matrix = Vec::with_capacity(12);

    for sign in VOWEL_SIGNS.iter() {
        let mut row = Vec::with_capacity(18);
        for cons in PURE_CONSONANTS.iter() {
            let ch = if sign.is_empty() {
                cons.trim_end_matches('்').to_string()
            } else {
                let base = cons.trim_end_matches('்');
                format!("{}{}", base, sign)
            };
            row.push(ch);
        }
        matrix.push(row);
    }
    matrix
}

/// Returns all 247 Tamil characters as JSON string (easy for frontend)
#[wasm_bindgen]
pub fn get_all_tamil_chars_json() -> String {
    let all = get_all_tamil_chars();
    serde_json::to_string(&all).unwrap()
}

/// Convert pure consonant + vowel index → Uyirmei character
#[wasm_bindgen]
pub fn pure_to_uyirmei(pure_cons: &str, vowel_index: usize) -> String {
    if vowel_index >= 12 {
        return String::new();
    }

    let sign = VOWEL_SIGNS[vowel_index];
    if sign.is_empty() {
        pure_cons.trim_end_matches('்').to_string()
    } else {
        let base = pure_cons.trim_end_matches('்');
        format!("{}{}", base, sign)
    }
}

/// Get Uyirmei character from consonant index and vowel index
#[wasm_bindgen]
pub fn get_uyirmei(cons_index: usize, vowel_index: usize) -> String {
    if cons_index >= 18 || vowel_index >= 12 {
        return String::new();
    }
    pure_to_uyirmei(PURE_CONSONANTS[cons_index], vowel_index)
}

/// Internal helper (not exposed to WASM)
fn get_all_tamil_chars() -> Vec<String> {
    let mut all = Vec::with_capacity(247);

    all.extend(VOWELS.iter().map(|s| s.to_string()));
    all.extend(PURE_CONSONANTS.iter().map(|s| s.to_string()));

    let matrix = generate_uyirmei_matrix();
    for row in matrix {
        all.extend(row);
    }
    all.push(AYTHAM.to_string());
    all
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_total() {
        assert_eq!(get_all_tamil_chars().len(), 247);
    }

    #[test]
    fn test_pure_to_uyirmei() {
        assert_eq!(pure_to_uyirmei("க்", 0), "க");
        assert_eq!(pure_to_uyirmei("க்", 1), "கா");
        assert_eq!(pure_to_uyirmei("ங்", 0), "ங");
        assert_eq!(pure_to_uyirmei("ங்", 11), "ஙௌ");
    }
}