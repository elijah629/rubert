import Move from "@/components/Move";
import { Move as CMove } from "@/lib/cube";
import { Card } from "@/components/ui/card";
import init, { solve } from "@/solver/solver";
import { For, createSignal, onMount } from "solid-js";
import { useParams } from "solid-start";

export default function Solve() {
	const { cube } = useParams<{ cube: string }>();
	const [solution, setSolution] = createSignal<Uint8ClampedArray>();
	const digits = cube.split("").map(x => Number(x));

	if (digits.length != 54) {
		return <>Invalid cube, there must be 54 facelets</>;
	}

	if (digits.includes(NaN) || digits.some(x => x < 0 || x > 5)) {
		return (
			<>
				Invalid cube, at least one of the facelets is not a number from
				0 to 5
			</>
		);
	}

	onMount(async () => {
		await init();

		setSolution(solve(Uint8Array.from(digits)));
	});

	return (
		<>
			{solution() ? (
				<>
					<h2 class="text-2xl font-bold">
						Solution in {solution()!.length} HTM,{" "}
						{solution()!
							.map(x =>
								[
									CMove.B2,
									CMove.D2,
									CMove.F2,
									CMove.L2,
									CMove.R2,
									CMove.U2
								].includes(x)
									? 2
									: 1
							)
							.reduce((a, c) => a + c, 0)}{" "}
						QTM
					</h2>
					<Card class="flex flex-wrap gap-2 overflow-auto p-4 [&>*]:w-20">
						<For each={Array.from(solution()!)}>
							{x => <Move move={x} />}
						</For>
					</Card>
				</>
			) : (
				<p>Solving</p>
			)}
		</>
	);
}
