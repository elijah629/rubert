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

					<form action="javascript:void(0);">

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
							type="submit"
							onClick={() => {
								// setOpen(false);
								
								// const moves = scramble_feild.value
								// .split(" ")
								// .filter(x => !!x);
								
								// if (moves.length === 0) {
								// 	showToast({
								// 		title: "Invalid Scramble",
								// 		variant: "destructive",
								// 		description: (
								// 			<>
								// 				Scramble must contain at least
								// 				one move
								// 			</>
								// 		)
								// 	});
								// 	return;
								// }
								
								// const scramble: Move[] = Array(moves.length);
								// const name_to_move: Record<string, Move> = {
								// 	"U": Move.U1,
								// 	"U2": Move.U2,
								// 	"U'": Move.U3,
								// 	"D": Move.D1,
								// 	"D2": Move.D2,
								// 	"D'": Move.D3,
								// 	"L": Move.L1,
								// 	"L2": Move.L2,
								// 	"L'": Move.L3,
								// 	"R": Move.R1,
								// 	"R2": Move.R2,
								// 	"R'": Move.R3,
								// 	"F": Move.F1,
								// 	"F2": Move.F2,
								// 	"F'": Move.F3,
								// 	"B": Move.B1,
								// 	"B2": Move.B2,
								// 	"B'": Move.B3
								// };

								// for (let i = 0; i < scramble.length; i++) {
								// 	const move = name_to_move[moves[i]];
									
								// 	if (move === undefined) {
								// 		showToast({
								// 			title: "Invalid Scramble",
								// 			variant: "destructive",
								// 			description: (
								// 				<>
								// 					{moves[i]} is not a valid
								// 					move. Example scramble:{" "}
								// 					<b>R U R' U'</b>
								// 				</>
								// 			)
								// 		});
								// 		return;
								// 	}
									
								// 	scramble[i] = move;
								// }
								// console.log(time_feild.value);
								// // props.onAdd({ scramble, time:  });
							}}>
							Import
						</Button>
					</DialogFooter>
								</form>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
