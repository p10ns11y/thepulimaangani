use crate::chars::*;
use crate::types::*;
use crate::utils::remove_punctuation;

pub fn get_letter_count(text: &str) -> LetterCount {
    let tamil_text = text.trim();
    let chars: Vec<char> = tamil_text.chars().collect();

    // Tamil character sets (from chars module)

    let mut vowel_count = 0;
    let mut consonant_count = 0; // pure consonants (with virama)
    let mut consonant_vowel_count = 0; // consonants with vowels
    let mut aytham_count = 0;
    let mut short_vowel_count = 0;
    let mut long_vowel_count = 0;

    let mut i = 0;
    while i < chars.len() {
        let current = chars[i].to_string();

        // Count aytham
        if current == AYTHAM {
            aytham_count += 1;
            i += 1;
            continue;
        }

        // Count independent vowels
        if INDEPENDENT_VOWELS.contains(&current.as_str()) {
            vowel_count += 1;

            // Classify short vs long vowels
            match current.as_str() {
                "அ" | "இ" | "உ" | "எ" | "ஒ" => short_vowel_count += 1,
                _ => long_vowel_count += 1,
            }

            i += 1;
            continue;
        }

        // Handle consonants
        if CONSONANTS.contains(&current.as_str()) {
            i += 1;

            // Check what follows the consonant
            if i < chars.len() {
                let next = chars[i].to_string();

                if next == VIRAMA {
                    // Pure consonant (consonant + virama)
                    consonant_count += 1;
                    i += 1; // skip virama
                } else if VOWEL_SIGNS.contains(&next.as_str()) {
                    // Consonant + vowel sign = consonant-vowel combination
                    consonant_vowel_count += 1;
                    vowel_count += 1;

                    // Classify vowel sign as short or long
                    match next.as_str() {
                        "ி" | "ு" | "ெ" | "ொ" => short_vowel_count += 1,
                        _ => long_vowel_count += 1,
                    }

                    i += 1; // skip vowel sign

                    // Check for aytham after vowel sign
                    if i < chars.len() && chars[i].to_string() == AYTHAM {
                        aytham_count += 1;
                        i += 1;
                    }
                } else {
                    // Bare consonant (shouldn't happen in proper Tamil, but count as consonant-vowel with implicit 'a')
                    consonant_vowel_count += 1;
                    vowel_count += 1;
                    short_vowel_count += 1; // implicit short 'a'
                }
            } else {
                // Consonant at end of text (implicit 'a')
                consonant_vowel_count += 1;
                vowel_count += 1;
                short_vowel_count += 1; // implicit short 'a'
            }
            continue;
        }

        // Skip other characters (spaces, punctuation, etc.)
        i += 1;
    }

    LetterCount {
        vowel: vowel_count,
        consonant: consonant_count,
        consonant_vowel: consonant_vowel_count,
        aytham: aytham_count,
        short: short_vowel_count,
        long: long_vowel_count,
    }
}

// Improved syllable detection following Tamil phonological rules
pub fn detect_syllables(text: &str) -> Vec<(String, SyllableType)> {
    let mut syllables = Vec::new();

    let chars: Vec<char> = text.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        let mut syllable = String::new();

        // Skip whitespace and punctuation
        if chars[i].is_whitespace() || !chars[i].is_alphabetic() {
            i += 1;
            continue;
        }

        let current = chars[i].to_string();

        // Case 1: Independent vowel
        if INDEPENDENT_VOWELS.contains(&current.as_str()) {
            syllable.push(chars[i]);
            i += 1;

            // Check for aytham
            if i < chars.len() && chars[i].to_string() == AYTHAM {
                syllable.push(chars[i]);
                i += 1;
            }

            // Independent vowels are Ner (short) except for long ones
            let is_long = matches!(current.as_str(), "ஆ" | "ஈ" | "ஊ" | "ஏ" | "ஐ" | "ஓ" | "ஔ");
            let syllable_type = if is_long {
                SyllableType::Nirai
            } else {
                SyllableType::Ner
            };
            syllables.push((syllable, syllable_type));
            continue;
        }

        // Case 2: Consonant-based syllable
        if CONSONANTS.contains(&current.as_str()) {
            syllable.push(chars[i]);
            i += 1;

            // Check what follows
            if i < chars.len() {
                let next = chars[i].to_string();

                // Case 2a: Consonant + vowel sign
                if SHORT_VOWEL_SIGNS.contains(&next.as_str())
                    || LONG_VOWEL_SIGNS.contains(&next.as_str())
                {
                    syllable.push(chars[i]);
                    i += 1;

                    // Check for aytham after vowel sign
                    if i < chars.len() && chars[i].to_string() == AYTHAM {
                        syllable.push(chars[i]);
                        i += 1;
                    }

                    // Determine type based on vowel sign
                    let syllable_type = if LONG_VOWEL_SIGNS.contains(&next.as_str()) {
                        SyllableType::Nirai
                    } else {
                        SyllableType::Ner
                    };
                    syllables.push((syllable, syllable_type));
                    continue;
                }

                // Case 2b: Consonant + virama (pure consonant)
                if next == VIRAMA {
                    syllable.push(chars[i]);
                    i += 1;

                    // Pure consonants are Ner
                    syllables.push((syllable, SyllableType::Ner));
                    continue;
                }

                // Case 2c: Consonant + consonant (implicit vowel, but should be handled by next iteration)
                // For now, treat as consonant with implicit short vowel
                syllables.push((syllable, SyllableType::Ner));
                continue;
            } else {
                // Consonant at end - implicit short vowel
                syllables.push((syllable, SyllableType::Ner));
                continue;
            }
        }

        // Skip unknown characters
        i += 1;
    }

    syllables
}

// Parse lines from text
pub fn parse_lines(text: &str) -> Vec<Line> {
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
