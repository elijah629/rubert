import { FaceletColor, facelet_color } from "@/lib/cube";
import { For } from "solid-js";

export default function CubeNet(props: {
	value: Map<FaceletColor, FaceletColor[]>;
	onClick?: (face: FaceletColor, index: number) => void;
}) {
	function DisplayFace(fprops: { face: FaceletColor }) {
		const start = {
			[FaceletColor.Red]: [2, 2],
			[FaceletColor.Orange]: [4, 2],
			[FaceletColor.Blue]: [3, 2],
			[FaceletColor.Green]: [1, 2],
			[FaceletColor.White]: [2, 1],
			[FaceletColor.Yellow]: [2, 3]
		}[fprops.face];
		return (
			<div
				class="grid aspect-square grid-cols-3 grid-rows-3 gap-1"
				style={{
					"grid-row-start": start[1],
					"grid-column-start": start[0]
				}}>
				<For each={props.value.get(fprops.face)}>
					{(x, i) => {
						const [h, s, l] = facelet_color[x as any];
						return props.onClick ? (
							<button
								aria-label={`Face ${
									FaceletColor[fprops.face]
								}, Color: ${FaceletColor[x!]}`}
								onClick={() => {
									props.onClick?.(fprops.face, i());
								}}
								class="rounded-sm border border-primary ring-offset-background transition-all hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								style={{
									background: `hsl(${h}deg, ${s}%, ${l}%)`
								}}></button>
						) : (
							<div
								class="rounded-sm border border-primary"
								style={{
									background: `hsl(${h}deg, ${s}%, ${l}%)`
								}}></div>
						);
					}}
				</For>
			</div>
		);
	}

	return (
		<div class="flex flex-1 items-center justify-center">
			<div class="grid w-full max-w-xl grid-cols-4 grid-rows-3 gap-2">
				<For each={[0, 1, 2, 3, 4, 5]}>
					{color => <DisplayFace face={color} />}
				</For>
			</div>
		</div>
	);
}
