use super::{facelet::Color, state::State};
use core::ops::Add;
use std::fmt;

// UDRLFB and their amounts. {move}3 refers to {move}'
#[rustfmt::skip]
#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum Move {
    U, U2, U3,
    D, D2, D3,
    R, R2, R3,
    L, L2, L3,
    F, F2, F3,
    B, B2, B3,
}

impl fmt::Display for Move {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::U => write!(f, "U"),
            Self::U2 => write!(f, "U2"),
            Self::U3 => write!(f, "U'"),

            Self::D => write!(f, "D"),
            Self::D2 => write!(f, "D2"),
            Self::D3 => write!(f, "D'"),

            Self::R => write!(f, "R"),
            Self::R2 => write!(f, "R2"),
            Self::R3 => write!(f, "R'"),

            Self::L => write!(f, "L"),
            Self::L2 => write!(f, "L2"),
            Self::L3 => write!(f, "L'"),

            Self::F => write!(f, "F"),
            Self::F2 => write!(f, "F2"),
            Self::F3 => write!(f, "F'"),

            Self::B => write!(f, "B"),
            Self::B2 => write!(f, "B2"),
            Self::B3 => write!(f, "B'"),
        }
    }
}

macro_rules! m {
    (U) => {
        Move::U | Move::U2 | Move::U3
    };
    (D) => {
        Move::D | Move::D2 | Move::D3
    };
    (R) => {
        Move::R | Move::R2 | Move::R3
    };
    (L) => {
        Move::L | Move::L2 | Move::L3
    };
    (F) => {
        Move::F | Move::F2 | Move::F3
    };
    (B) => {
        Move::B | Move::B2 | Move::B3
    };
}

impl Move {
    pub fn is_inverse(&self, rhs: Move) -> bool {
        matches!(
            (self, rhs),
            (m!(U), m!(D)) | (m!(R), m!(L)) | (m!(F), m!(B)),
        )
    }

    /// Checks equality of only the face
    pub fn face_eq(&self, rhs: Move) -> bool {
        matches!(
            (self, rhs),
            (m!(U), m!(U))
                | (m!(D), m!(D))
                | (m!(R), m!(R))
                | (m!(L), m!(L))
                | (m!(F), m!(F))
                | (m!(B), m!(B))
        )
    }
}

impl Add for Move {
    type Output = Option<Move>;

    fn add(self, rhs: Move) -> Self::Output {
        if !self.face_eq(rhs) {
            panic!("Cannot add two moves ({self} + {rhs} ) that do not have equal faces, did you mean to construct an algorithim from them?");
        }

        let (a, b) = (self.count(), rhs.count());

        let new_count = (a + b) % 4;
        if new_count == 0 {
            return None;
        }

        Some(Move::from_face_and_count(self.face(), new_count))
    }
}

#[derive(Debug)]
pub enum Face {
    U,
    D,
    R,
    L,
    F,
    B,
}

macro_rules! fc {
    (U, $count: expr) => {
        match $count {
            1 => Move::U,
            2 => Move::U2,
            3 => Move::U3,
            _ => unreachable!(),
        }
    };
    (D, $count: expr) => {
        match $count {
            1 => Move::D,
            2 => Move::D2,
            3 => Move::D3,
            _ => unreachable!(),
        }
    };
    (R, $count: expr) => {
        match $count {
            1 => Move::R,
            2 => Move::R2,
            3 => Move::R3,
            _ => unreachable!(),
        }
    };
    (L, $count: expr) => {
        match $count {
            1 => Move::L,
            2 => Move::L2,
            3 => Move::L3,
            _ => unreachable!(),
        }
    };
    (F, $count: expr) => {
        match $count {
            1 => Move::F,
            2 => Move::F2,
            3 => Move::F3,
            _ => unreachable!(),
        }
    };
    (B, $count: expr) => {
        match $count {
            1 => Move::B,
            2 => Move::B2,
            3 => Move::B3,
            _ => unreachable!(),
        }
    };
}

impl Move {
    pub fn count(&self) -> u8 {
        match self {
            Move::U => 1,
            Move::U2 => 2,
            Move::U3 => 3,

            Move::D => 1,
            Move::D2 => 2,
            Move::D3 => 3,

            Move::R => 1,
            Move::R2 => 2,
            Move::R3 => 3,

            Move::L => 1,
            Move::L2 => 2,
            Move::L3 => 3,

            Move::F => 1,
            Move::F2 => 2,
            Move::F3 => 3,

            Move::B => 1,
            Move::B2 => 2,
            Move::B3 => 3,
        }
    }

    pub fn face(&self) -> Face {
        match self {
            Move::U => Face::U,
            Move::U2 => Face::U,
            Move::U3 => Face::U,

            Move::D => Face::D,
            Move::D2 => Face::D,
            Move::D3 => Face::D,

            Move::R => Face::R,
            Move::R2 => Face::R,
            Move::R3 => Face::R,

            Move::L => Face::L,
            Move::L2 => Face::L,
            Move::L3 => Face::L,

            Move::F => Face::F,
            Move::F2 => Face::F,
            Move::F3 => Face::F,

            Move::B => Face::B,
            Move::B2 => Face::B,
            Move::B3 => Face::B,
        }
    }

    pub fn from_face_and_count(face: Face, count: u8) -> Self {
        match face {
            Face::U => fc!(U, count),
            Face::D => fc!(D, count),
            Face::R => fc!(R, count),
            Face::L => fc!(L, count),
            Face::F => fc!(F, count),
            Face::B => fc!(B, count),
        }
    }
}

pub fn is_move_available(previous_move: Move, current_move: Move) -> bool {
    current_move != previous_move
        && !current_move.is_inverse(previous_move)
        && !current_move.face_eq(previous_move)
}

use super::state::{Corner::*, Edge::*};

pub const U_MOVE: State = State {
    cp: [UFL, UBL, UBR, UFR, DFL, DFR, DBR, DBL],
    co: [0; 8],
    ep: [BL, BR, FR, FL, UL, UB, UR, UF, DF, DR, DB, DL],
    eo: [0; 12],
};

pub const D_MOVE: State = State {
    cp: [UBL, UBR, UFR, UFL, DBL, DFL, DFR, DBR],
    co: [0; 8],
    ep: [BL, BR, FR, FL, UB, UR, UF, UL, DL, DF, DR, DB],
    eo: [0; 12],
};

pub const R_MOVE: State = State {
    cp: [UBL, UFR, DFR, UFL, DFL, DBR, UBR, DBL],
    co: [0, 1, 2, 0, 0, 1, 2, 0],
    ep: [BL, UR, DR, FL, UB, FR, UF, UL, DF, BR, DB, DL],
    eo: [0; 12],
};

pub const L_MOVE: State = State {
    cp: [DBL, UBR, UFR, UBL, UFL, DFR, DBR, DFL],
    co: [2, 0, 0, 1, 2, 0, 0, 1],
    ep: [DL, BR, FR, UL, UB, UR, UF, BL, DF, DR, DB, FL],
    eo: [0; 12],
};

pub const F_MOVE: State = State {
    cp: [UBL, UBR, UFL, DFL, DFR, UFR, DBR, DBL],
    co: [0, 0, 1, 2, 1, 2, 0, 0],
    ep: [BL, BR, UF, DF, UB, UR, FL, UL, FR, DR, DB, DL],
    eo: [0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0],
};

pub const B_MOVE: State = State {
    cp: [UBR, DBR, UFR, UFL, DFL, DFR, DBL, UBL],
    co: [1, 2, 0, 0, 0, 0, 1, 2],
    ep: [UB, DB, FR, FL, BR, UR, UF, UL, DF, DR, BL, DL],
    eo: [1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
};

/// An algorithim is a list of moves.
#[derive(Clone, Default, PartialEq)]
pub struct Algorithim(Vec<Move>);

impl Algorithim {
    pub fn len(&self) -> usize {
        self.0.len()
    }

    /// WIP WIP WIP
    pub fn simplify(self) -> Self {
        let mut simplified = self.0.iter().map(|&x| Some(x)).collect::<Box<_>>();

        for (i, &cm) in simplified.clone().iter().enumerate() {
            if let Some(cm) = cm {
                let same_face_index = simplified.iter().position(|m| match m {
                    Some(m) => cm.face_eq(*m),
                    None => false,
                });

                if let Some(sfi) = same_face_index {
                    simplified[i] = cm + simplified[sfi].unwrap();
                    simplified[sfi] = None;
                }
            }
        }

        Self(simplified.iter().flatten().map(|&x| x).collect())
        // Self(
        //     self.0
        //         .iter()
        //         .map(|&x| Some(x))
        //         .enumerate()
        //         .fold(
        //             self.0.clone().iter().map(|&x| Some(x)).collect::<Vec<_>>(),
        //             |mut simplified, (i, cm)| {
        //                 println!("H");
        //                 if let Some(cm) = cm {
        //                     let cm: Move = cm;
        //                     let same_face_index = simplified.iter().position(|m| match m {
        //                         Some(m) => cm.face_eq(*m),
        //                         None => false,
        //                     });

        //                     if let Some(sfi) = same_face_index {
        //                         simplified[i] = cm + simplified[sfi].unwrap();
        //                         simplified[sfi] = None;
        //                     }
        //                 }
        //                 simplified
        //             },
        //         )
        //         .iter()
        //         .flatten()
        //         .map(|&x| x)
        //         .collect(),
        // )
    }
}

impl From<Vec<Move>> for Algorithim {
    fn from(value: Vec<Move>) -> Self {
        Algorithim(value)
    }
}

impl Into<Box<[u8]>> for Algorithim {
    fn into(self) -> Box<[u8]> {
        self.0
            .into_iter()
            .map(|x| match x {
                Move::U => 0,
                Move::U2 => 1,
                Move::U3 => 2,

                Move::D => 3,
                Move::D2 => 4,
                Move::D3 => 5,

                Move::R => 6,
                Move::R2 => 7,
                Move::R3 => 8,

                Move::L => 9,
                Move::L2 => 10,
                Move::L3 => 11,

                Move::F => 12,
                Move::F2 => 13,
                Move::F3 => 14,

                Move::B => 15,
                Move::B2 => 16,
                Move::B3 => 17,
            })
            .collect::<Box<[u8]>>()
    }
}

impl fmt::Display for Algorithim {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let stringified = self
            .0
            .iter()
            .map(|m| m.to_string())
            .collect::<Vec<_>>()
            .join(" ");

        write!(f, "{stringified}")
    }
}
