import { Cube, PartialCube } from "@/lib/cube";
import { Button } from "./ui/button";

export default function SolveButton(props: { cube: PartialCube }) {
    return <Button
					onClick={() => {
						const cube_string = Cube.from_partial(props.cube)
							.wasm_facelets()
							.join("");
						window
							.open(
								`${window.origin}/solve/${cube_string}`,
								"_blank"
							)
							?.focus();
					}}>
					Solve
				</Button>
}