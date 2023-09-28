use core::fmt;

#[derive(Debug)]
pub enum Error {
    InvalidColor,
    InvalidEdge,
    InvalidCorner,
    TooManyPieces,
    UnsolveableCube,
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", match self {
            Self::TooManyPieces => "Too many facelets on a color",
            Self::InvalidColor => "Invalid color value",
            Self::InvalidEdge => "Invalid edge value",
            Self::InvalidCorner => "Invalid corner value",
            Self::UnsolveableCube => "Unsolveable Cube",
        })
    }
}
