// use core::fmt;
// use wasm_bindgen::prelude::*;

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

// #[wasm_bindgen]
// extern "C" {
//     #[wasm_bindgen(js_namespace = console)]
//     fn log(s: &str);
// }

// #[doc(hidden)]
// pub fn _printjs_args(args: fmt::Arguments) {
//     log(&args.to_string());
// }

// #[macro_export]
// macro_rules! printjs {
//     () => { printjs!("\n"); };
//     ($($arg:tt)*) => {{
//         $crate::utils::_printjs_args(format_args!($($arg)*));
//     }};
// }
