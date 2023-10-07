use crate::error::Error;

use self::{Corner::*, Edge::*};
use std::ops::Mul;

use super::{
    facelet::{Color, Cube, CORNER_COLOR, CORNER_FACELET, EDGE_COLOR, EDGE_FACELET},
    moves::{Move, B_MOVE, D_MOVE, F_MOVE, L_MOVE, R_MOVE, U_MOVE},
};

/// Represents the 8 corners on the cube, described by the layer they are on.
#[rustfmt::skip]
#[allow(clippy::upper_case_acronyms)]
#[derive(Debug, PartialEq, PartialOrd, Clone, Copy)]
pub enum Corner {
    UBL, UBR, UFR, UFL,
    DFL, DFR, DBR, DBL,
}

impl TryFrom<u8> for Corner {
    type Error = Error;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(UBL),
            1 => Ok(UBR),
            2 => Ok(UFR),
            3 => Ok(UFL),
            4 => Ok(DFL),
            5 => Ok(DFR),
            6 => Ok(DBR),
            7 => Ok(DBL),
            _ => Err(Error::InvalidCorner),
        }
    }
}

/// Represents the 12 edges on the cube, described by the layer they are on.
/// Example: BL (Bottom, Left).
#[rustfmt::skip]
#[allow(clippy::upper_case_acronyms)]
#[derive(Debug, PartialEq, PartialOrd, Clone, Copy)]
pub enum Edge {
    BL, BR, FR, FL,
    UB, UR, UF, UL,
    DF, DR, DB, DL,
}

impl TryFrom<u8> for Edge {
    type Error = Error;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(BL),
            1 => Ok(BR),
            2 => Ok(FR),
            3 => Ok(FL),
            4 => Ok(UB),
            5 => Ok(UR),
            6 => Ok(UF),
            7 => Ok(UL),
            8 => Ok(DF),
            9 => Ok(DR),
            10 => Ok(DB),
            11 => Ok(DL),
            _ => Err(Error::InvalidEdge),
        }
    }
}

/// Cube on the cubie level.
#[derive(Debug, PartialEq, Clone, Copy)]
pub struct State {
    /// Corner permutation, relative to SOLVED_STATE.
    pub cp: [Corner; 8],
    /// Corner orientation, 3 possible values: 0 (correctly oriented), 1 (twisted clockwise), 2 (twisted counter-clockwise).
    pub co: [u8; 8],
    /// Edge permutation, relative to SOLVED_STATE.
    pub ep: [Edge; 12],
    /// Edge orientation, 2 possible values: 0 (correctly oriented), 1 (flipped).
    pub eo: [u8; 12],
}

impl Mul for State {
    type Output = Self;

    fn mul(self, rhs: State) -> Self::Output {
        let mut res = SOLVED_STATE;
        // (A * B).c = A(B(x).c).c
        // (A * B).o = A(B(x).c).o + B(x).o

        for i in 0..8 {
            res.cp[i] = self.cp[rhs.cp[i] as usize];
            res.co[i] = (self.co[rhs.cp[i] as usize] + rhs.co[i]) % 3;
        }

        for i in 0..12 {
            res.ep[i] = self.ep[rhs.ep[i] as usize];
            res.eo[i] = (self.eo[rhs.ep[i] as usize] + rhs.eo[i]) % 2;
        }

        res
    }
}

impl State {
    pub fn apply_move(self, move_name: Move) -> Self {
        let move_state = match move_name {
            Move::U => U_MOVE,
            Move::U2 => U_MOVE * U_MOVE,
            Move::U3 => U_MOVE * U_MOVE * U_MOVE,

            Move::D => D_MOVE,
            Move::D2 => D_MOVE * D_MOVE,
            Move::D3 => D_MOVE * D_MOVE * D_MOVE,

            Move::R => R_MOVE,
            Move::R2 => R_MOVE * R_MOVE,
            Move::R3 => R_MOVE * R_MOVE * R_MOVE,

            Move::L => L_MOVE,
            Move::L2 => L_MOVE * L_MOVE,
            Move::L3 => L_MOVE * L_MOVE * L_MOVE,

            Move::F => F_MOVE,
            Move::F2 => F_MOVE * F_MOVE,
            Move::F3 => F_MOVE * F_MOVE * F_MOVE,

            Move::B => B_MOVE,
            Move::B2 => B_MOVE * B_MOVE,
            Move::B3 => B_MOVE * B_MOVE * B_MOVE,
        };

        self * move_state
    }

    /// Returns the number of corner permutations needed to solve the corners.
    pub fn count_corner_perm(&self) -> u8 {
        let mut count = 0;
        let mut cp = self.cp;

        for i in 0..8 {
            if cp[i] as usize != i {
                if let Some(j) = (i + 1..8).find(|&j| cp[j] as usize == i) {
                    cp.swap(i, j);
                    count += 1;
                }
            }
        }

        count
    }

    /// Returns the number of edge permutations needed to solve the edges.
    pub fn count_edge_perm(&self) -> u8 {
        let mut count = 0;
        let mut ep = self.ep;

        for i in 0..12 {
            if ep[i] as usize != i {
                if let Some(j) = (i + 1..12).find(|&j| ep[j] as usize == i) {
                    ep.swap(i, j);
                    count += 1;
                }
            }
        }

        count
    }
}

impl From<&Vec<Move>> for State {
    fn from(moves: &Vec<Move>) -> Self {
        let mut state = SOLVED_STATE;

        for m in moves {
            state = state.apply_move(*m);
        }

        state
    }
}

/// Gives State (cubie) representation of a face cube (facelet).
impl TryFrom<&Cube> for State {
    type Error = Error;
    fn try_from(face_cube: &Cube) -> Result<Self, Self::Error> {
        let mut ori: usize = 0;
        let mut state = SOLVED_STATE;
        let mut col1;
        let mut col2;

        for i in 0..8 {
            let i = Corner::try_from(i)?;
            // get the colors of the cubie at corner i, starting with U/D
            for index in 0..3 {
                ori = index;
                if face_cube.facelets[CORNER_FACELET[i as usize][ori] as usize] == Color::U
                    || face_cube.facelets[CORNER_FACELET[i as usize][ori] as usize] == Color::D
                {
                    break;
                }
            }

            col1 = face_cube.facelets[CORNER_FACELET[i as usize][(ori + 1) % 3] as usize];
            col2 = face_cube.facelets[CORNER_FACELET[i as usize][(ori + 2) % 3] as usize];

            for j in 0..8 {
                let j = Corner::try_from(j)?;
                if col1 == CORNER_COLOR[j as usize][1] && col2 == CORNER_COLOR[j as usize][2] {
                    // in cornerposition i we have cornercubie j
                    state.cp[i as usize] = j;
                    state.co[i as usize] = ori as u8 % 3;
                    break;
                }
            }
        }

        for i in 0..12 {
            let i = Edge::try_from(i)?;
            for j in 0..12 {
                let j = Edge::try_from(j)?;
                if face_cube.facelets[EDGE_FACELET[i as usize][0] as usize]
                    == EDGE_COLOR[j as usize][0]
                    && face_cube.facelets[EDGE_FACELET[i as usize][1] as usize]
                        == EDGE_COLOR[j as usize][1]
                {
                    state.ep[i as usize] = j;
                    state.eo[i as usize] = 0;
                    break;
                }
                if face_cube.facelets[EDGE_FACELET[i as usize][0] as usize]
                    == EDGE_COLOR[j as usize][1]
                    && face_cube.facelets[EDGE_FACELET[i as usize][1] as usize]
                        == EDGE_COLOR[j as usize][0]
                {
                    state.ep[i as usize] = j;
                    state.eo[i as usize] = 1;
                    break;
                }
            }
        }

        let c_perm = state.count_corner_perm();
        let e_perm = state.count_edge_perm();

        if c_perm % 2 != e_perm % 2 {
            Err(Error::UnsolveableCube)
        } else {
            Ok(state)
        }
    }
}

pub const SOLVED_STATE: State = State {
    cp: [UBL, UBR, UFR, UFL, DFL, DFR, DBR, DBL],
    co: [0; 8],
    ep: [BL, BR, FR, FL, UB, UR, UF, UL, DF, DR, DB, DL],
    eo: [0; 12],
};
