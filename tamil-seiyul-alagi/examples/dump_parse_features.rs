//! Print [`ParseFeatureSnapshot`](thepulimaangani_parser::ParseFeatureSnapshot) as JSON for stdin text or first CLI argument.
//!
//! ```text
//! echo 'கற்றது' | cargo run --example dump_parse_features
//! cargo run --example dump_parse_features -- 'கற்றது மொழி'
//! ```

use thepulimaangani_parser::{parse_poem, ParseFeatureSnapshot, ParseOptions};

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let text = if args.is_empty() {
        use std::io::Read;
        let mut buf = String::new();
        std::io::stdin().read_to_string(&mut buf).expect("stdin");
        buf
    } else {
        args.join(" ")
    };

    let mut opts = ParseOptions::default();
    opts.no_detect = true;

    match parse_poem(text.trim(), opts) {
        Ok(result) => {
            let snap = ParseFeatureSnapshot::from(&result);
            println!("{}", serde_json::to_string_pretty(&snap).expect("json"));
        }
        Err(e) => {
            eprintln!("parse error: {e}");
            std::process::exit(1);
        }
    }
}
