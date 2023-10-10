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
    let mut solver = Solver::new(&MOVE_TABLE, &PRUNING_TABLE, GODS_NUMBER + 3); // adding so we dont search for too long
    let solution = solver.solve(state).ok_or(Error::NoSolution)?;

    // Serialize the solution into bytes to send to JS
    let mut bytes: Box<[u8]> = solution.into();

    // SAFETY: No mutability, and not resizing buffer
    Ok(unsafe { Uint8ClampedArray::view_mut_raw(bytes.as_mut_ptr(), bytes.len()) })
}

/// Half-random state. Generates random moves then solves.. the generated moves. SHOULD BE FINE.
#[wasm_bindgen]
pub fn generate_scramble(length: u8) -> Uint8ClampedArray {
    let mut rng = thread_rng();
    let mut state = SOLVED_STATE;

    for m in (0..length).scan(None, |last_move, _| {
        let possible_moves = match *last_move {
            Some(m) => MOVES
                .iter()
                .filter(|x| !x.face_eq(m))
                .cloned()
                .collect::<Vec<_>>(),
            None => MOVES.to_vec(),
        };

        let move_choice = possible_moves.choose(&mut rng);
        *last_move = move_choice.cloned();

        Some(*move_choice.unwrap())
    }) {
        state *= m.into();
    }

    let mut solver = Solver::new(&MOVE_TABLE, &PRUNING_TABLE, 25); // 25 is standard scramble I think
    let solution = solver.solve(state).unwrap();

    // Serialize the solution into bytes to send to JS
    let mut bytes: Box<[u8]> = solution.into();

    // SAFETY: No mutability, and not resizing buffer
    unsafe { Uint8ClampedArray::view_mut_raw(bytes.as_mut_ptr(), bytes.len()) }
}
