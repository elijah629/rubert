pub mod moves;
pub mod pruning;
pub mod utils;

use crate::cube::{
    index::{
        co_to_index, cp_to_index, e_combo_to_index, e_ep_to_index, eo_to_index, ud_ep_to_index,
    },
    moves::{is_move_available, Algorithim, Move},
    state::{State, SOLVED_STATE},
};
use moves::MoveTable;
use pruning::PruningTable;
use utils::{MOVES, PHASE2_MOVES};

trait Phase {
    fn is_solved(&self) -> bool;
    fn next(&self, table: &MoveTable, move_index: usize) -> Self;
    fn prune(&self, table: &PruningTable, depth: u8) -> bool;
}

struct Phase1 {
    co_index: usize,
    eo_index: usize,
    e_combo_index: usize,
}

impl Phase for Phase1 {
    fn is_solved(&self) -> bool {
        self.co_index == 0 && self.eo_index == 0 && self.e_combo_index == 0
    }

    fn next(&self, table: &MoveTable, move_index: usize) -> Self {
        let co_index = table.co[self.co_index][move_index].into();
        let eo_index = table.eo[self.eo_index][move_index].into();
        let e_combo_index = table.e_combo[self.e_combo_index][move_index].into();

        Self {
            co_index,
            eo_index,
            e_combo_index,
        }
    }

    fn prune(&self, table: &PruningTable, depth: u8) -> bool {
        let co_e_dist = table.co_e[self.co_index][self.e_combo_index];
        let eo_e_dist = table.eo_e[self.eo_index][self.e_combo_index];
        let max = co_e_dist.max(eo_e_dist);

        max > depth
    }
}

impl From<State> for Phase1 {
    fn from(value: State) -> Self {
        let co_index = co_to_index(&value.co).into();
        let eo_index = eo_to_index(&value.eo).into();
        let e_combo_index = e_combo_to_index(&value.ep).into();

        Self {
            co_index,
            eo_index,
            e_combo_index,
        }
    }
}

struct Phase2 {
    cp_index: usize,
    ep_index: usize,
    e_ep_index: usize,
}

impl From<State> for Phase2 {
    fn from(value: State) -> Self {
        let cp_index = cp_to_index(&value.cp).into();
        let ep_index = ud_ep_to_index(&value.ep).into();
        let e_ep_index = e_ep_to_index(&value.ep).into();

        Self {
            cp_index,
            ep_index,
            e_ep_index,
        }
    }
}

impl Phase for Phase2 {
    fn is_solved(&self) -> bool {
        self.cp_index == 0 && self.ep_index == 0 && self.e_ep_index == 0
    }

    fn next(&self, table: &MoveTable, move_index: usize) -> Self {
        let cp_index = table.cp[self.cp_index][move_index].into();
        let ep_index = table.ep[self.ep_index][move_index].into();
        let e_ep_index = table.e_ep[self.e_ep_index][move_index].into();

        Self {
            cp_index,
            ep_index,
            e_ep_index,
        }
    }

    fn prune(&self, table: &PruningTable, depth: u8) -> bool {
        let cp_e_dist = table.cp_e[self.cp_index][self.e_ep_index];
        let ep_e_dist = table.ep_e[self.ep_index][self.e_ep_index];
        let max = cp_e_dist.max(ep_e_dist);

        max > depth
    }
}

/// Two phase solver struct for more control.
pub struct Solver<'a> {
    move_table: &'a MoveTable,
    pruning_table: &'a PruningTable,
    max_length: u8,
    initial_state: State,
    solution_phase1: Vec<Move>,
    solution_phase2: Vec<Move>,
    best_solution: Option<Algorithim>,
}

impl<'a> Solver<'a> {
    pub fn new(move_table: &'a MoveTable, pruning_table: &'a PruningTable, max_length: u8) -> Self {
        Self {
            move_table,
            pruning_table,
            initial_state: SOLVED_STATE,
            max_length,
            solution_phase1: vec![],
            solution_phase2: vec![],
            best_solution: None,
        }
    }

    /// Solves the cube using the two phase algorithm.
    pub fn solve(&mut self, state: State) -> Option<Algorithim> {
        self.initial_state = state;
        for depth in 0..=self.max_length {
            let state = Phase1::from(state);
            let found = self.solve_phase1(state, depth);

            if found {
                return self.best_solution.clone();
            }
        }

        None
    }

    fn solve_phase1(&mut self, state: Phase1, depth: u8) -> bool {
        if depth == 0 && state.is_solved() {
            let mut cube_state = self.initial_state;

            for m in &self.solution_phase1 {
                cube_state = cube_state.apply_move(*m);
            }

            let max_depth = if self.solution_phase1.is_empty() {
                self.max_length
            } else if self.max_length > self.solution_phase1.len() as u8 {
                self.max_length - self.solution_phase1.len() as u8
            } else {
                return true;
            };

            for phase2_depth in 0..max_depth {
                let state = Phase2::from(cube_state);
                if self.solve_phase2(state, phase2_depth) {
                    return true;
                }
            }

            return false;
        }

        if state.prune(self.pruning_table, depth) || depth == 0 {
            return false;
        }

        for (i, m) in MOVES.iter().enumerate() {
            if let Some(prev) = self.solution_phase1.last() {
                if !is_move_available(*prev, *m) {
                    continue;
                }
            }

            self.solution_phase1.push(*m);
            let new_state = state.next(self.move_table, i);
            let found = self.solve_phase1(new_state, depth - 1);

            if found {
                return true;
            }

            self.solution_phase1.pop();
        }

        false
    }

    fn solve_phase2(&mut self, state: Phase2, depth: u8) -> bool {
        if depth == 0 && state.is_solved() {
            let solution: Algorithim = [
                self.solution_phase1.as_slice(),
                self.solution_phase2.as_slice(),
            ]
            .concat()
            .into();

            if let Some(best_solution) = &mut self.best_solution {
                if best_solution.len() > solution.len() {
                    *best_solution = solution
                }
            } else {
                self.best_solution = Some(solution)
            }

            return true;
        }

        if state.prune(self.pruning_table, depth) || depth == 0 {
            return false;
        }

        for (i, m) in PHASE2_MOVES.iter().enumerate() {
            if let Some(prev) = self.solution_phase2.last() {
                if !is_move_available(*prev, *m) {
                    continue;
                }
            } else if let Some(prev) = self.solution_phase1.last() {
                if !is_move_available(*prev, *m) {
                    continue;
                }
            }

            self.solution_phase2.push(*m);
            let new_state = state.next(self.move_table, i);
            let found = self.solve_phase2(new_state, depth - 1);

            if found {
                return true;
            }

            self.solution_phase2.pop();
        }

        false
    }
}
