use crate::cube::moves::Move::{self, *};

// https://cube20.org
pub const GODS_NUMBER: u8 = 20;

pub const CO_COUNT: u16 = 2187;
pub const EO_COUNT: u16 = 2048;
pub const E_COMBO_COUNT: u16 = 495;

pub const CP_COUNT: u16 = 40320;
pub const UD_EP_COUNT: u16 = 40320;
pub const E_EP_COUNT: u16 = 24;

pub const MOVES: [Move; 18] = [
    U, U2, U3, D, D2, D3, R, R2, R3, L, L2, L3, F, F2, F3, B, B2, B3,
];
pub const PHASE2_MOVES: [Move; 10] = [U, U2, U3, D, D2, D3, R2, L2, F2, B2];

pub type Table<T> = Vec<Vec<T>>;
