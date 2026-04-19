use regex::Regex;
use std::collections::HashMap;

// Remove punctuation from text (simplified)
pub fn remove_punctuation(text: &str) -> String {
    text.chars()
        .filter(|c| !c.is_ascii_punctuation() && *c != '।' && *c != '॥') // Add Tamil punctuation if needed
        .collect()
}

// Tamil to Romanized transliteration (based on PHP tam2lat)
pub fn tamil_to_romanized(text: &str) -> String {
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
