use core::fmt;

#[derive(Debug)]
pub enum Error {
    InvalidColor,
    InvalidEdge,
    InvalidCorner,
    UnsolveableCube,
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidColor => write!(f, "Invalid color value"),
            Self::InvalidEdge => write!(f, "Invalid edge value"),
            Self::InvalidCorner => write!(f, "Invalid corner value"),
            Self::UnsolveableCube => write!(f, "Unsolveable Cube"),
        }
    }
}
