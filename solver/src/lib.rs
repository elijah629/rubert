mod cube;
mod error;
mod solver;
mod utils;

use crate::solver::utils::{GODS_NUMBER, MOVES};
use cube::{
    facelet::Cube,
    state::{State, SOLVED_STATE},
};
use error::Error;
use js_sys::Uint8ClampedArray;
use lazy_static::lazy_static;
use rand::{seq::SliceRandom, thread_rng};
use solver::{moves::MoveTable, pruning::PruningTable, Solver};
use wasm_bindgen::prelude::*;

// TODO: Return this from a function, then store in localstorage maybe
lazy_static! {
    static ref PRUNING_TABLE: PruningTable = PruningTable::default();
    static ref MOVE_TABLE: MoveTable = MoveTable::default();
}

// let move_table = MoveTable::default();

#[wasm_bindgen]
pub fn solve(facelets: &[u8]) -> Result<Uint8ClampedArray, Error> {
    utils::set_panic_hook();

    let cube = Cube::try_from(facelets)?;

    let state = State::try_from(&cube)?;
    // let pruning_table = PruningTable::default();
    // let move_table = MoveTable::default();
    let mut solver = Solver::new(&MOVE_TABLE, &PRUNING_TABLE, GODS_NUMBER + 3); // adding 3 so we dont search for too long
    let solution = solver.solve(state).ok_or(Error::NoSolution)?;

    // Serialize the solution into bytes to send to JS
    let mut bytes: Box<[u8]> = solution.into();

    // SAFETY: No mutability, and not resizing buffer
    Ok(unsafe { Uint8ClampedArray::view_mut_raw(bytes.as_mut_ptr(), bytes.len()) })
}

/// Generates a random 3x3x3 scramble
#[wasm_bindgen]
pub fn scramble_3x3x3() -> Uint8ClampedArray {
    let mut rng = thread_rng();
    let mut state = SOLVED_STATE;

    for m in (0..30).map(|_| {
        MOVES.choose(&mut rng).unwrap()
    }) {
        state *= (*m).into();
    }

    let mut solver = Solver::new(&MOVE_TABLE, &PRUNING_TABLE, 25); 
    let solution = solver.solve(state).unwrap().reverse();

    // Serialize the solution into bytes to send to JS
    let mut bytes: Box<[u8]> = solution.into();

    // SAFETY: No mutability, and not resizing buffer
    unsafe { Uint8ClampedArray::view_mut_raw(bytes.as_mut_ptr(), bytes.len()) }
}
