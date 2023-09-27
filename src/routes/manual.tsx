import CubeNet from "@/components/CubeNet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cube, PartialCube, FaceletColor, facelet_color } from "@/lib/cube";
import { createSignal, For } from "solid-js";

export default function Manual() {
	const [cube, setCube] = createSignal<PartialCube>({}, { equals: false });
	const [color, setColor] = createSignal<FaceletColor | null>(null);

	setCube(cube => {
		for (let i = 0; i <= 5; i++) {
			cube[i as FaceletColor] = [i, i, i, i, i, i, i, i, i];
		}
		return cube;
	});

	return (
		<>
			<CubeNet
				value={cube()}
				onClick={(face, i) => {
					if (color() === null) {
						return;
					}

					setCube(cube => {
						cube[face]![i] = color();
						return cube;
					});
				}}
			/>

			<div class="flex items-end justify-between p-4">
				<Card class="grid grid-cols-3 grid-rows-2 gap-1 p-4">
					<For each={[...Array(6).keys()]}>
						{fcolor => {
							const [h, s, l] = facelet_color[fcolor as any];
							return (
								<div
									onClick={() => setColor(fcolor)}
									class={`h-10 w-10 rounded-sm text-destructive-foreground ring-offset-background transition-all hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
										color() === fcolor
											? "border-2 border-primary"
											: "border"
									}`}
									style={{
										background: `hsl(${h}deg, ${s}%, ${l}%)`
									}}></div>
							);
						}}
					</For>
				</Card>
				<Button
					onClick={() => {
						const cube_string = Cube.from_partial(cube())
							.wasm_facelets()
							.join("");
						window
							.open(
								`${window.origin}/solve/${cube_string}`,
								"_blank"
							)
							?.focus();
						// const valid = true;
						// if (!valid) {
						// 	showToast({
						// 		title: "Invalid cube",
						// 		description: (
						// 			<span>
						// 				Your cube has a non-even amount of
						// 				swaps. Check if your input is valid. If
						// 				you are sure you have made no mistakes,
						// 				your cube is unsolvable. Follow{" "}
						// 				<a
						// 					target="_blank"
						// 					class="font-medium underline underline-offset-4"
						// 					href="https://thecube.guru/rubiks-cube-solution/unsolvable/">
						// 					this guide
						// 				</a>{" "}
						// 				to fix your cube.
						// 			</span>
						// 		),
						// 		variant: "destructive"
						// 	});
						// 	return;
						// }
						// try {
						// 	const facelets = Cube.from_partial(
						// 		cube()
						// 	).wasm_facelets();
						// 	const solved = solve(facelets);
						// 	console.log(
						// 		solved,
						// 		Array.from(solved)
						// 			.map(x => Move[x])
						// 			.join(" ")
						// 	);
						// } catch (e) {
						// 	console.error(e);
						// 	showToast({
						// 		title: "Error",
						// 		description: "" + e,
						// 		variant: "destructive"
						// 	});
						// 	return;
						// }
					}}>
					Solve
				</Button>
			</div>
		</>
	);
}
