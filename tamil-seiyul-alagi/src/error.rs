use thiserror::Error;

#[derive(Error, Debug)]
pub enum ParseError {
    #[error("Input text is empty")]
    EmptyInput,
    #[error("Failed to parse: {0}")]
    InvalidText(String),
}
