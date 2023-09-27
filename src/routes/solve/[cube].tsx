import Move from "@/components/Move";
import { Move as CMove } from "@/lib/cube";
import { Card } from "@/components/ui/card";
import { solve } from "@/solver/solver";
import { For } from "solid-js";
import { useParams } from "solid-start";

export default function Solve() {
	const { cube } = useParams<{ cube: string }>();
	const digits = cube.split("").map(x => Number(x));

	if (digits.length != 54) {
		return <>Invalid cube, there must be 54 facelets</>;
	}

	if (digits.includes(NaN)) {
		return (
			<>
				Invalid cube, at least one of the facelets is not a number from
				0 to 5
			</>
		);
	}

	const x = solve(Uint8Array.from(digits));

	return (
		<>
			<h2 class="text-2xl font-bold">Solution in {x.length} HTM, {x.map(x => [CMove.B2, CMove.D2, CMove.F2, CMove.L2, CMove.R2, CMove.U2].includes(x) ? 2 : 1).reduce((a, c) => a + c)} QTM</h2>
			<Card class="flex flex-wrap gap-2 overflow-auto p-4 [&>*]:w-20">
				<For each={Array.from(x)}>{x => <Move move={x} />}</For>
			</Card>
		</>
	);
}
