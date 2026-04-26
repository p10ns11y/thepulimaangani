use thiserror::Error;

#[derive(Error, Debug)]
pub enum ParseError {
    #[error("Input text is empty")]
    EmptyInput,
    #[error("Failed to parse: {0}")]
    InvalidText(String),
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn formats_empty_input_error() {
        let err = ParseError::EmptyInput;
        assert_eq!(format!("{}", err), "Input text is empty");
    }

    #[test]
    fn formats_invalid_text_error() {
        let err = ParseError::InvalidText("bad sequence".to_string());
        assert_eq!(format!("{}", err), "Failed to parse: bad sequence");
    }
}
