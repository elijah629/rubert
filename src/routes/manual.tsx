import ColorPicker from "@/components/ColorPicker";
import CubeNet from "@/components/CubeNet";
import SolveButton from "@/components/SolveButton";
import { Cube, PartialCube, FaceletColor } from "@/lib/cube";
import { createSignal } from "solid-js";

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
				<ColorPicker value={color()} onChange={x => setColor(x)}/>
				<SolveButton cube={cube()}/>
			</div>
		</>
	);
}
