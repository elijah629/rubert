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
import { createSignal } from "solid-js";
import { Move, name_to_move } from "@/lib/cube";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IconDownload } from "@/lib/icons";

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
					<IconDownload size={20} />
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

								const scramble = scramble_feild.value
									.split(" ")
									.map(x => name_to_move.get(x)!);

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
