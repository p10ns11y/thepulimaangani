const SYLLABLE_TYPES: [&str; 2] = ["nE_r", "nirY"];

const WORD_TYPES: [(&str, &str); 6] = [
    ("nE_rnE_r", "tEmA"),
    ("nirYnE_r", "puLimA"),
    ("nE_rnirY", "kUviLa_m"),
    ("nirYnirY", "karuviLa_m"),
    // ... (full list from original PHP — I included the most common ones; we'll expand as needed)
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

// Tamil character sets
pub const INDEPENDENT_VOWELS: [&str; 12] =
    ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ"];
pub const VOWEL_SIGNS: [&str; 11] = ["ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"];
pub const CONSONANTS: [&str; 23] = [
    "க", "ங", "ச", "ஜ", "ஞ", "ட", "ண", "த", "ந", "ன", "ப", "ம", "ய", "ர", "ற", "ல", "ள", "ழ", "வ",
    "ஶ", "ஷ", "ஸ", "ஹ",
];
pub const VIRAMA: &str = "்";
pub const AYTHAM: &str = "ஃ";

pub const SHORT_VOWEL_SIGNS: [&str; 4] = ["ி", "ு", "ெ", "ொ"];
pub const LONG_VOWEL_SIGNS: [&str; 7] = ["ா", "ீ", "ூ", "ே", "ோ", "ௌ", "ை"];

// Foot classification map (WordType from PHP) - expanded with more traditional types
pub fn get_word_type(pattern: &str) -> &'static str {
    match pattern {
        // Basic 2-syllable feet
        "nE_rnE_r" => "tEmA",
        "nirYnE_r" => "puLimA",
        "nE_rnirY" => "kUviLa_m",
        "nirYnirY" => "karuviLa_m",

        // 3-syllable feet (angaay)
        "nE_rnE_rnE_r" => "tEmA_GkA_y",
        "nirYnE_rnE_r" => "puLimA_GkA_y",
        "nE_rnirYnE_r" => "kUviLa_GkA_y",
        "nirYnirYnE_r" => "karuviLa_GkA_y",

        // 3-syllable feet (kavi)
        "nE_rnE_rnirY" => "tEmA_GkaVi",
        "nirYnE_rnirY" => "puLimA_GkaVi",
        "nE_rnirYnirY" => "kUviLa_GkaVi",
        "nirYnirYnirY" => "karuviLa_GkaVi",

        // 4-syllable feet (puu)
        "nE_rnE_rnE_rnE_r" => "tEmA_nta_NpU",
        "nirYnE_rnE_rnE_r" => "puLimA_nta_NpU",
        "nE_rnirYnE_rnE_r" => "kUviLa_nta_NpU",
        "nirYnirYnE_rnE_r" => "karuviLa_nta_NpU",

        // 4-syllable feet (arum puu)
        "nE_rnE_rnirYnE_r" => "tEmAnaRu_mpU",
        "nirYnE_rnirYnE_r" => "puLimAnaRu_mpU",
        "nE_rnirYnirYnE_r" => "kUviLanaRu_mpU",
        "nirYnirYnirYnE_r" => "karuviLanaRu_mpU",

        // 4-syllable feet (nizhal)
        "nE_rnE_rnirYnirY" => "tEmAnaRuniZa_l",
        "nirYnE_rnirYnirY" => "puLimAnaRuniZa_l",
        "nE_rnirYnirYnirY" => "kUviLanaRuniZa_l",
        "nirYnirYnirYnirY" => "karuviLanaRuniZa_l",

        // 4-syllable feet (nta nizhal)
        "nE_rnE_rnE_rnirY" => "tEmA_nta_NNiZa_l",
        "nirYnE_rnE_rnirY" => "puLimA_nta_NNiZa_l",
        "nE_rnirYnE_rnirY" => "kUviLa_nta_NNiZa_l",
        "nirYnirYnE_rnirY" => "karuviLa_nta_NNiZa_l",

        // Single syllable feet
        "nE_r" => "mA",
        "nirY" => "viLa_m",

        // 5-syllable feet
        "nE_rnE_rnE_rnE_rnE_r" => "tEmA_GkA_yi_Ra_pU",
        "nirYnE_rnE_rnE_rnE_r" => "puLimA_GkA_yi_Ra_pU",
        "nE_rnirYnE_rnE_rnE_r" => "kUviLa_GkA_yi_Ra_pU",
        "nirYnirYnE_rnE_rnE_r" => "karuviLa_GkA_yi_Ra_pU",

        _ => "unknown",
    }
}
