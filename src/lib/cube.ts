/**
 * Represents the color of a facelet
 */
export enum FaceletColor {
	Red,
	Orange,
	Blue,
	Green,
	White,
	Yellow
}

/**
 * A possible move. Interopts with the WASM module
 */
export enum Move {
	U1,
	U2,
	U3,
	D1,
	D2,
	D3,
	R1,
	R2,
	R3,
	L1,
	L2,
	L3,
	F1,
	F2,
	F3,
	B1,
	B2,
	B3
}

/**
 * 9 {@link FaceletColor}s
 */
export type Face = [
	FaceletColor,
	FaceletColor,
	FaceletColor,
	FaceletColor,
	FaceletColor,
	FaceletColor,
	FaceletColor,
	FaceletColor,
	FaceletColor
];

/**
 * Class for storing a cube. Identity cube side to the {@link FaceletColor}s.
 */
export class Cube {
	public [FaceletColor.Red]: Face;
	public [FaceletColor.Orange]: Face;
	public [FaceletColor.Blue]: Face;
	public [FaceletColor.Green]: Face;
	public [FaceletColor.White]: Face;
	public [FaceletColor.Yellow]: Face;

	constructor(cube: Record<FaceletColor, Face>) {
		// ew
		this[FaceletColor.Red] = cube[FaceletColor.Red];
		this[FaceletColor.Orange] = cube[FaceletColor.Orange];
		this[FaceletColor.Blue] = cube[FaceletColor.Blue];
		this[FaceletColor.Green] = cube[FaceletColor.Green];
		this[FaceletColor.White] = cube[FaceletColor.White];
		this[FaceletColor.Yellow] = cube[FaceletColor.Yellow];
	}

	/** Returns a facelet array for the WASM api. It maps:
	 *
	 *  W      U
	 * GRBO = LFRB
	 *  Y      D
	 *
	 *  @returns {string}
	 */
	public wasm_facelets(): Uint8Array {
		const numbers = [
			this[FaceletColor.White],
			this[FaceletColor.Blue],
			this[FaceletColor.Red],
			this[FaceletColor.Yellow],
			this[FaceletColor.Green],
			this[FaceletColor.Orange]
		].flat();
		return Uint8Array.from(numbers.map(x => [2, 5, 1, 4, 0, 3][x])); // FBRLUD, check the facelets.rs Color struct for more info on these numbers
	}

	/**
	 * Takes a {@link PartialCube}, validates it to be complete, and casts it to a {@link Cube}
	 *
	 * @param {PartialCube} partial_cube The {@link PartialCube} to convert
	 *
	 * @returns {Cube}
	 */
	public static from_partial(partial_cube: PartialCube): Cube {
		if (Object.keys(partial_cube).length !== 6) {
			throw new Error(
				"Tried to construct Cube from PartialCube where some faces are missing"
			);
		}

		for (let i = 0; i <= 5; i++) {
			if (partial_cube[i as FaceletColor]!.includes(null)) {
				throw new Error(
					`The ${FaceletColor[i]} face of the PartialCube is missing some colors`
				);
			}
		}

		return new Cube(partial_cube as Record<FaceletColor, Face>);
	}
}

/**
 * {@link Cube} but it can have missing colors or faces represented by null
 */
export type PartialCube = Partial<
	Record<FaceletColor, (FaceletColor | null)[]>
>;

export const facelet_color: Record<
	FaceletColor | any,
	[number, number, number]
> = {
	[FaceletColor.Red]: [0, 100, 59],
	[FaceletColor.Orange]: [30, 100, 59],
	[FaceletColor.Blue]: [223, 100, 59],
	[FaceletColor.Green]: [129, 100, 40],
	[FaceletColor.White]: [0, 0, 100],
	[FaceletColor.Yellow]: [50, 100, 59]
};
