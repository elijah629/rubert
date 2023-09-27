import * as wasm from "./solver_bg.wasm";
import { __wbg_set_wasm } from "./solver_bg.js";
__wbg_set_wasm(wasm);
export * from "./solver_bg.js";
