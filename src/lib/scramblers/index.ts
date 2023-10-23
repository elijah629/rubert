import { Move } from "@/lib/cube";
import init, { scramble_3x3x3 } from "@/solver/solver";

/**
 * I converted https://jperm.net/lib/pll.js and https://jperm.net/lib/oll.js's scrambles to the move enum's numbers, then I converted it to a binary format
 * I Used ```
	ALG.flat().map(x => x.split(" ").map(x => ({ "U": 0, "U2": 1, "U'": 2, "D": 3, "D2": 4, "D'": 5, "R": 6, "R2": 7, "R'": 8, "L": 9, "L2": 10, "L'": 11, "F": 12, "F2": 13, "F'": 14, "B": 15, "B2": 16, "B'": 17 })[x])).map(x => x.map(x => String.fromCharCode(x + 1)).join("")).join("\x00")
```
*/
export const scramblers: Map<string, () => Move[] | Promise<Move[]>> = new Map([
	[
		"3x3x3",
		async () => {
			// Ensure the WASM module is loaded
			await init();

			// Generate a scramble and convert it to an array
			return Array.from(scramble_3x3x3());
		}
	],

	[
		"F2L",
		async () => {
			const inserts = [
				[
					[Move.R1, Move.U1, Move.R3],
					[Move.R1, Move.U3, Move.R3],
					[Move.R3, Move.U3, Move.R1],
					[Move.R3, Move.U1, Move.R1]
				],
				[
					[Move.L3, Move.U3, Move.L1],
					[Move.L3, Move.U1, Move.L1],
					[Move.L1, Move.U1, Move.L3],
					[Move.L1, Move.U3, Move.L3]
				]
			];
			let set_1 = false;
			const scramble: Move[] = [];

			for (let i = 0; i < 8; i++) {
				scramble.push(...rand(inserts[+set_1]));
				set_1 = !set_1;
			}

			return scramble;
		}
	],

	["Full PLL", decode_rand("/scramblers/full-pll")],
	["Full OLL", decode_rand("/scramblers/full-oll")],

	["2-Look PLL", decode_rand("/scramblers/2look-pll")],
	["2-Look OLL", decode_rand("/scramblers/2look-oll")]
]);

function decode_rand(file: string): () => Promise<Move[]> {
	return async () =>
		rand(
			await fetch(file)
				.then(x => x.text())
				.then(x => x.split("\x00"))
		)
			.split("")
			.map(x => (x.charCodeAt(0) - 1) as Move);
}

function rand<T>(arr: T[]): T {
	return arr[rand_index(arr)];
}

function rand_index<T>(arr: T[]): number {
	return Math.floor(Math.random() * arr.length);
}
