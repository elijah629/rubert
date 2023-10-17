import { As } from "@kobalte/core";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TbDownload } from "solid-icons/tb";
import { createSignal } from "solid-js";
import { Move } from "@/lib/cube";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { showToast } from "./toast";

export default function ImportScramble(props: {
	onImport: (scramble: Move[]) => void;
}) {
	const [open, setOpen] = createSignal<boolean>(false);
	let scramble_feild!: HTMLInputElement;

	return (
		<Dialog
			open={open()}
			onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<As
					component={Button}
					class="gap-2">
					<TbDownload size={20} />
				</As>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Import a scramble</DialogTitle>
					<DialogDescription>
						Want to use a scramble? Add it here!
					</DialogDescription>

					<div class="grid gap-4 py-4">
						<div class="grid grid-cols-4 items-center gap-4">
							<Label
								for="scramble"
								class="text-right">
								Scramble
							</Label>
							<Input
								oninvalid={() =>
									scramble_feild.setCustomValidity(
										"Follow standard notation, example: R U R' U'"
									)
								}
								oninput={() =>
									scramble_feild.setCustomValidity("")
								}
								pattern="[UDLRFB][2']?( [UDLRFB][2']?)*"
								required
								id="scramble"
								class="col-span-3"
								ref={scramble_feild}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							onClick={() => {
								if (!scramble_feild.reportValidity()) {
								    return;
								}
										
								const name_to_move: Record<string, Move> = {
									"U": Move.U1,
									"U2": Move.U2,
									"U'": Move.U3,
									"D": Move.D1,
									"D2": Move.D2,
									"D'": Move.D3,
									"L": Move.L1,
									"L2": Move.L2,
									"L'": Move.L3,
									"R": Move.R1,
									"R2": Move.R2,
									"R'": Move.R3,
									"F": Move.F1,
									"F2": Move.F2,
									"F'": Move.F3,
									"B": Move.B1,
									"B2": Move.B2,
									"B'": Move.B3
								};

								const scramble = scramble_feild.value
									.split(" ")
									.map(x => name_to_move[x]);

								props.onImport(scramble);
								setOpen(false);
							}}>
							Import
						</Button>
					</DialogFooter>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
