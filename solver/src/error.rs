use core::fmt;
use wasm_bindgen::JsValue;

#[derive(Debug)]
pub enum Error {
    InvalidColor,
    InvalidEdge,
    InvalidCorner,
    TooManySame,
    NoSolution,
    UnsolveableCube,
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{}",
            match self {
                Self::InvalidColor => "Invalid color during conversion",
                Self::InvalidEdge => "Invalid edge during conversion",
                Self::InvalidCorner => "Invalid corner during conversion",
                Self::UnsolveableCube => "The cube is unsolveable",
                Self::TooManySame => "More than 9 facelets of the same color",
                Self::NoSolution => "The solver did not find a solution",
            }
        )
    }
}

impl From<Error> for JsValue {
    fn from(val: Error) -> Self {
        val.to_string().into()
    }
}
