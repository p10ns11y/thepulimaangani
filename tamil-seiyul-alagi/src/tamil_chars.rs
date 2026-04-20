// Tamil Character Set - Complete 247 Characters
// Clean & Idiomatic Rust version for thepulimaangani

pub const VOWELS: [&str; 12] = ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ"];

pub const PURE_CONSONANTS: [&str; 18] = [
    "க்", "ங்", "ச்", "ஞ்", "ட்", "ண்", "த்", "ந்", "ப்", "ம்", "ய்", "ர்", "ல்", "வ்", "ழ்", "ள்", "ற்", "ன்",
];

pub const AYTHAM: &str = "ஃ";

/// Vowel signs corresponding to each vowel index
const VOWEL_SIGNS: [&str; 12] = ["", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"];

/// Generates the 12×18 Uyirmei matrix at runtime
pub fn generate_uyirmei_matrix() -> Vec<Vec<String>> {
    let mut matrix = Vec::with_capacity(12);

    for sign in VOWEL_SIGNS.iter() {
        let mut row = Vec::with_capacity(18);

        for cons in PURE_CONSONANTS.iter() {
            let char = if sign.is_empty() {
                // Remove pulli for 'அ'
                cons.trim_end_matches('்').to_string()
            } else {
                // Combine base consonant + vowel sign
                let base = cons.trim_end_matches('்');
                format!("{}{}", base, sign)
            };
            row.push(char);
        }
        matrix.push(row);
    }

    matrix
}

/// Returns all 247 Tamil characters
pub fn get_all_tamil_chars() -> Vec<String> {
    let mut all = Vec::with_capacity(247);

    // 12 Vowels
    all.extend(VOWELS.iter().map(|s| s.to_string()));

    // 18 Pure Consonants
    all.extend(PURE_CONSONANTS.iter().map(|s| s.to_string()));

    // 216 Uyirmei
    let matrix = generate_uyirmei_matrix();
    for row in matrix {
        all.extend(row);
    }

    // 1 Aytham
    all.push(AYTHAM.to_string());

    all
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_total_247() {
        let all = get_all_tamil_chars();
        assert_eq!(all.len(), 247);
    }

    #[test]
    fn test_matrix_shape() {
        let matrix = generate_uyirmei_matrix();
        assert_eq!(matrix.len(), 12);
        assert_eq!(matrix[0].len(), 18);
    }

    #[test]
    fn test_first_uyirmei() {
        let matrix = generate_uyirmei_matrix();
        assert_eq!(matrix[0][0], "க"); // க் + அ
        assert_eq!(matrix[0][1], "ங"); // ங் + அ
        assert_eq!(matrix[1][0], "கா"); // க் + ஆ
    }
}
