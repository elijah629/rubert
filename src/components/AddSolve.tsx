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
import { TbPlus } from "solid-icons/tb";
import { createSignal } from "solid-js";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Solve } from "@/routes";
import {
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectContent,
	Select
} from "./ui/select";
import { name_to_move } from "@/lib/cube";

export default function AddSolve(props: { onAdd: (solve: Solve) => void }) {
	const [open, setOpen] = createSignal<boolean>(false);
	const [penalty, setPenalty] = createSignal<string>();
	let time_feild!: HTMLInputElement;
	let scramble_feild!: HTMLInputElement;

	return (
		<Dialog
			open={open()}
			onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<As
					component={Button}
					variant="ghost"
					class="h-8 w-8 p-0"
					aria-label="Solve actions">
					<TbPlus size={16} />
				</As>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add solve</DialogTitle>
					<DialogDescription>
						Add a solve that you have completed to this session
					</DialogDescription>

					<div class="grid gap-4 py-4">
						<div class="grid grid-cols-4 items-center gap-4">
							<Label
								for="time"
								class="text-right">
								Time
							</Label>
							<Input
								required
								type="number"
								id="time"
								class="col-span-3"
								ref={time_feild}
							/>
							<Label
								for="scramble"
								class="text-right">
								Scramble
							</Label>
							<Input
								required
								id="scramble"
								class="col-span-3"
								ref={scramble_feild}
							/>
							<Label
								for="penalty"
								class="text-right">
								Penalty
							</Label>
							<Select
								required
								class="col-span-3"
								value={penalty()}
								onChange={setPenalty}
								options={["DNF", "+2"]}
								placeholder="None"
								itemComponent={props => (
									<SelectItem item={props.item}>
										{props.item.rawValue}
									</SelectItem>
								)}>
								<SelectTrigger
									id="penalty"
									aria-label="Scrambler"
									class="w-full">
									<SelectValue<string>>
										{state => state.selectedOption()}
									</SelectValue>
								</SelectTrigger>
								<SelectContent />
							</Select>
						</div>
					</div>

					<DialogFooter>
						<Button
							onClick={() => {
								if (
									!time_feild.reportValidity() ||
									!scramble_feild.reportValidity()
								) {
									return;
								}

								const scramble = scramble_feild.value
									.split(" ")
									.map(x => name_to_move.get(x)!);

								props.onAdd({
									dnf: penalty() === "DNF",
									plus_2: penalty() === "+2",
									time: Number(time_feild.value) * 1000,
									scramble: scramble
								});

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
