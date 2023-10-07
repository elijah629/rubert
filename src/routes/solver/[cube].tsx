import Move from "@/components/Move";
import { Move as CMove } from "@/lib/cube";
import { Card } from "@/components/ui/card";
import init, { solve } from "@/solver/solver";
import { For, Show, createSignal, onMount } from "solid-js";
import { useParams } from "solid-start";
import { Result } from "@/lib/result";

export default function Solve() {
	const { cube } = useParams<{ cube: string }>();
	const [solution, setSolution] =
		createSignal<Result<Uint8ClampedArray, string>>();
	const digits = cube.split("").map(x => Number(x));

	onMount(async () => {
		await init();

		setSolution(
			Result.auto<Uint8ClampedArray, string>(() => {
				if (digits.length != 54) {
					throw "Invalid cube, there must be 54 facelets";
				}

				if (digits.includes(NaN) || digits.some(x => x < 0 || x > 5)) {
					throw "Invalid cube, at least one of the facelets is not a number from 0 to 5";
				}

				return solve(Uint8Array.from(digits));
			})
		);
	});

	return (
		<>
			<Show
				when={solution()}
				fallback={<p>Solving...</p>}>
				<>
					{solution()!.match({
						ok(x) {
							return (
								<>
									<h2 class="text-2xl font-bold">
										Solution in {x.length} HTM,{" "}
										{x
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
										<For each={Array.from(x)}>
											{x => <Move move={x} />}
										</For>
									</Card>
								</>
							);
						},
						err(e) {
							console.log(e);
							return (
								<p class="rounded-md bg-destructive p-4 font-bold">
									Error: {e}
								</p>
							);
						}
					})}
				</>
			</Show>
		</>
	);
}
