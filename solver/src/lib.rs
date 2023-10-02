mod cube;
mod error;
mod solver;
mod utils;

use crate::solver::utils::GODS_NUMBER;
use cube::{facelet::Cube, state::State};
use error::Error;
use js_sys::Uint8ClampedArray;
use solver::{moves::MoveTable, pruning::PruningTable, Solver};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn solve(facelets: &[u8]) -> Result<Uint8ClampedArray, Error> {
    utils::set_panic_hook();

    let cube = Cube::try_from(facelets)?;

    let state = State::try_from(&cube)?;
    let pruning_table = PruningTable::default();
    let move_table = MoveTable::default();
    let mut solver = Solver::new(&move_table, &pruning_table, GODS_NUMBER + 3); // adding so we dont search for too long
    let solution = solver.solve(state).ok_or(Error::NoSolution)?;

    // Serialize the solution into bytes to send to JS
    let mut bytes: Box<[u8]> = solution.into();

    // SAFETY: No mutability, and not resizing buffer
    Ok(unsafe { Uint8ClampedArray::view_mut_raw(bytes.as_mut_ptr(), bytes.len()) })
}
