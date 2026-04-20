// Tamil Character Set - Standalone Runnable Version
// Run with: cargo run --bin tamil_chars_main
// Or: rustc tamil_chars_main.rs -o tamil_chars && ./tamil_chars

fn main() {
    println!("=== Tamil Character Set (247 Characters) ===\n");

    // 12 Vowels
    let vowels = [
        "அ", "ஆ", "இ", "ஈ", "உ", "ஊ",
        "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ",
    ];

    // 18 Pure Consonants
    let pure_consonants = [
        "க்", "ங்", "ச்", "ஞ்", "ட்", "ண்",
        "த்", "ந்", "ப்", "ம்", "ய்", "ர்",
        "ல்", "வ்", "ழ்", "ள்", "ற்", "ன்",
    ];

    let aytham = "ஃ";

    // Vowel signs
    let vowel_signs = ["", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"];

    // Generate Uyirmei Matrix
    let mut uyirmei_matrix: Vec<Vec<String>> = Vec::new();

    for sign in vowel_signs.iter() {
        let mut row = Vec::new();
        for cons in pure_consonants.iter() {
            let ch = if sign.is_empty() {
                cons.trim_end_matches('்').to_string()
            } else {
                let base = cons.trim_end_matches('்');
                format!("{}{}", base, sign)
            };
            row.push(ch);
        }
        uyirmei_matrix.push(row);
    }

    // === Print Summary ===
    println!("Vowels (12): {:?}", vowels);
    println!("Pure Consonants (18): {:?}", pure_consonants);
    println!("Aytham: {}", aytham);
    println!("Uyirmei Matrix: 12 × 18 = 216 characters\n");

    // === Print Full Uyirmei Matrix ===
    println!("=== Uyirmei Matrix (12 rows × 18 columns) ===\n");
    for (i, row) in uyirmei_matrix.iter().enumerate() {
        print!("{:2} | ", i);
        for ch in row {
            print!("{:4}", ch);
        }
        println!();
    }

    // === Collect All 247 Characters ===
    let mut all_chars: Vec<String> = Vec::new();
    all_chars.extend(vowels.iter().map(|s| s.to_string()));
    all_chars.extend(pure_consonants.iter().map(|s| s.to_string()));
    for row in &uyirmei_matrix {
        all_chars.extend(row.iter().cloned());
    }
    all_chars.push(aytham.to_string());

    println!("\n=== Total Characters ===");
    println!("Total: {} characters", all_chars.len());

    // === Print First 30 and Last 10 ===
    println!("\nFirst 30 characters:");
    for (i, ch) in all_chars.iter().take(30).enumerate() {
        print!("{:3}: {}  ", i, ch);
        if (i + 1) % 10 == 0 { println!(); }
    }

    println!("\n\nLast 10 characters:");
    for (i, ch) in all_chars.iter().rev().take(10).rev().enumerate() {
        println!("{:3}: {}", all_chars.len() - 10 + i, ch);
    }

    // === Test pure_to_uyirmei ===
    println!("\n=== Test: pure_to_uyirmei ===");
    println!("க் + அ (index 0) = {}", pure_to_uyirmei("க்", 0, &vowel_signs));
    println!("க் + ஆ (index 1) = {}", pure_to_uyirmei("க்", 1, &vowel_signs));
    println!("ங் + ஔ (index 11) = {}", pure_to_uyirmei("ங்", 11, &vowel_signs));

    println!("\n✅ Tamil character set loaded successfully!");
}

fn pure_to_uyirmei(pure_cons: &str, vowel_index: usize, vowel_signs: &[&str]) -> String {
    if vowel_index >= 12 {
        return String::new();
    }
    let sign = vowel_signs[vowel_index];
    if sign.is_empty() {
        pure_cons.trim_end_matches('்').to_string()
    } else {
        let base = pure_cons.trim_end_matches('்');
        format!("{}{}", base, sign)
    }
}