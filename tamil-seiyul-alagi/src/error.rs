//! Error types for the parser.

use thiserror::Error;

#[derive(Error, Debug)]
pub enum ParseError {
    #[error("Input text is empty")]
    EmptyInput,

    #[error("Failed to parse Tamil text: {0}")]
    InvalidText(String),

    #[error("Unsupported metre or rule violation: {0}")]
    MetreViolation(String),

    #[error("WASM serialization error")]
    SerializationError,
}