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

/** Returns a facelet array for the WASM api. It maps:
 *
 *  W      U
 * GRBO = LFRB
 *  Y      D
 *
 *  @returns {string}
 */
export function wasm_facelets(
	cube: Map<FaceletColor, FaceletColor[]>
): Uint8Array {
	const numbers = [
		cube.get(FaceletColor.White)!,
		cube.get(FaceletColor.Blue)!,
		cube.get(FaceletColor.Red)!,
		cube.get(FaceletColor.Yellow)!,
		cube.get(FaceletColor.Green)!,
		cube.get(FaceletColor.Orange)!
	].flat();
	return Uint8Array.from(numbers.map(x => [2, 5, 1, 4, 0, 3][x])); // FBRLUD, check the facelets.rs Color struct for more info on these numbers
}

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
