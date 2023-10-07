use super::{
    moves::{
        get_co_table, get_cp_table, get_e_combo_table, get_e_ep_table, get_eo_table,
        get_ud_ep_table,
    },
    utils::{Table, MOVES, PHASE2_MOVES},
};

/// Collection of pruning table for filtering unsolvable state at a given depth.
pub struct PruningTable {
    pub co_e: Table<u8>,
    pub eo_e: Table<u8>,
    pub cp_e: Table<u8>,
    pub ep_e: Table<u8>,
}

impl Default for PruningTable {
    fn default() -> Self {
        Self {
            co_e: get_prune_table(get_co_table(), get_e_combo_table(), MOVES.len()),
            eo_e: get_prune_table(get_eo_table(), get_e_combo_table(), MOVES.len()),
            cp_e: get_prune_table(get_cp_table(), get_e_ep_table(), PHASE2_MOVES.len()),
            ep_e: get_prune_table(get_ud_ep_table(), get_e_ep_table(), PHASE2_MOVES.len()),
        }
    }
}

pub fn get_prune_table(table1: Table<u16>, table2: Table<u16>, n_moves: usize) -> Table<u8> {
    let len1 = table1.len();
    let len2 = table2.len();
    let fill_size = len1 * len2;
    let mut pruning_table = vec![vec![255; len2]; len1];
    let mut distance = 0;
    let mut filled: usize = 1;

    pruning_table[0][0] = 0;

    while filled != fill_size {
        for i in 0..len1 {
            for (j, t2_j) in table2.iter().enumerate() {
                if pruning_table[i][j] == distance {
                    for (m, &t2_jm) in t2_j.iter().enumerate().take(n_moves) {
                        let next1 = table1[i][m] as usize;
                        let next2 = t2_jm as usize;
                        if pruning_table[next1][next2] == 255 {
                            pruning_table[next1][next2] = distance + 1;
                            filled += 1;
                        }
                    }
                }
            }
        }

        distance += 1;
    }

    pruning_table
}
