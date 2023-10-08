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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TbPlus } from "solid-icons/tb";
import { createSignal } from "solid-js";

export default function NewSessionButton(props: {
	onCreate: (name: string) => void;
}) {
	const [open, setOpen] = createSignal<boolean>(false);
	let name_feild!: HTMLInputElement;

	return (
		<Dialog
			open={open()}
			onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<As
					component={Button}
					class="gap-2">
					New
					<TbPlus size={20} />
				</As>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New Session</DialogTitle>
					<DialogDescription>
						Create a session to store your solves.
					</DialogDescription>

					<div class="grid gap-4 py-4">
						<div class="grid grid-cols-4 items-center gap-4">
							<Label
								for="name"
								class="text-right">
								Name
							</Label>
							<Input
								id="name"
								class="col-span-3"
								ref={name_feild}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							onClick={() => {
								setOpen(false);
								props.onCreate(name_feild.value);
							}}>
							Create
						</Button>
					</DialogFooter>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
