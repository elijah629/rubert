import Move from "@/components/Move";
import { Move as CMove } from "@/lib/cube";
import { Card } from "@/components/ui/card";
import init, { solve } from "@/solver/solver";
import { For, Show, createSignal, onMount } from "solid-js";
import { useParams } from "solid-start";
import { Separator } from "@/components/ui/separator";

export default function Solve() {
	const { cube } = useParams<{ cube: string }>();
	const [solution, setSolution] = createSignal<Uint8ClampedArray>();
	const [error, setError] = createSignal<string>();

	const digits = cube.split("").map(x => Number(x));

	if (digits.length != 54) {
		setError("More than 54 facelets");
	} else if (digits.includes(NaN) || digits.some(x => x < 0 || x > 5)) {
		setError("At least one of the facelets is not a number from 0 to 5");
	}

	onMount(async () => {
		if (error()) {
			return;
		}

		await init();
		try {
			setSolution(solve(Uint8Array.from(digits)));
		} catch (e) {
			setError(e as string);
		}
	});

	return (
		<>
			<Show
				when={solution() || error()}
				fallback={<p>Solving...</p>}>
				<Show
					when={solution()}
					fallback={
						<p class="rounded-md bg-destructive p-4 font-bold">
							Error: {error()!}
						</p>
					}>
					<h2 class="text-2xl font-bold">
						Solution in {solution()!.length} HTM or{" "}
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
						QTM moves
					</h2>
					<Card class="flex flex-wrap gap-2 overflow-auto p-4">
						<For each={[...solution()!]}>
							{(x, i) => (
								<>
									<Move
										class="w-14"
										move={x}
									/>
									<Show
										when={
											i() !== solution()!.length - 1 &&
											(i() + 1) % 3 === 0
										}>
										<Separator orientation="vertical" />
									</Show>
								</>
							)}
						</For>
					</Card>
				</Show>
			</Show>
		</>
	);
}
