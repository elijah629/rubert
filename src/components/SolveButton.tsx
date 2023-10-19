import { FaceletColor, wasm_facelets } from "@/lib/cube";
import { Button } from "./ui/button";

export default function SolveButton(props: {
	cube: Map<FaceletColor, FaceletColor[]>;
}) {
	return (
		<Button
			onClick={() => {
				const cube_string = wasm_facelets(props.cube).join("");
				window
					.open(`${window.origin}/solver/${cube_string}`, "_blank")
					?.focus();
			}}>
			Solve
		</Button>
	);
}
