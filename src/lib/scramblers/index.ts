import { Move } from "@/lib/cube";
import init, { scramble_3x3x3 } from "@/solver/solver";

/**
 * I converted https://jperm.net/lib/pll.js and https://jperm.net/lib/oll.js's scrambles to the move enum's numbers ( compression )
 * Used ```
ALG.flat().map(x => x.split(" ").map(x => ({
	"U": 0,
	"U2": 1,
	"U'": 2,
	"D": 3,
	"D2": 4,
	"D'": 5,
	"R": 6,
	"R2": 7,
	"R'": 8,
	"L": 9,
	"L2": 10,
	"L'": 11,
	"F": 12,
	"F2": 13,
	"F'": 14,
	"B": 15,
	"B2": 16,
	"B'": 17
})[x]))
```
 * Then I minified the outputted array
*/
export const scramblers: Map<string, () => Move[] | Promise<Move[]>> = new Map([
	[
		"3x3x3",
		async () => {
			// Ensure the WASM module is loaded
			await init();
			return Array.from(scramble_3x3x3());
		}
	],
	// these files are HUGE!! only load them when they need to be loaded
	// this also removes them from the main bundle decreasing load times
	["Full PLL", async () => rand((await import("./full-pll")).default)],
	["Full OLL", async () => rand((await import("./full-oll")).default)],

	["2-Look PLL", async () => rand((await import("./2look-pll")).default)],
	["2-Look OLL", async () => rand((await import("./2look-oll")).default)]
]);

function rand<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}
