import ColorPicker from "@/components/ColorPicker";
import CubeNet from "@/components/CubeNet";
import SolveButton from "@/components/SolveButton";
import { FaceletColor } from "@/lib/cube";
import { createSignal } from "solid-js";

export default function Manual() {
	const [cube, setCube] = createSignal<Map<FaceletColor, FaceletColor[]>>(
		new Map(),
		{ equals: false }
	);
	const [color, setColor] = createSignal<FaceletColor | null>(null);

	setCube(cube => {
		for (let i = 0; i <= 5; i++) {
			cube.set(i as FaceletColor, Array(9).fill(i));
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
						const new_face = cube.get(face)!;
						new_face[i] = color()!;
						cube.set(face, new_face);
						return cube;
					});
				}}
			/>

			<div class="flex items-end justify-between p-4">
				<ColorPicker
					value={color()}
					onChange={x => setColor(x)}
				/>
				<SolveButton cube={cube()} />
			</div>
		</>
	);
}
