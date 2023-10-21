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
import { IconTrash } from "@/lib/icons";

export default function DeleteSessionButton(props: {
	has_session: boolean;
	onDelete: () => void;
}) {
	const [open, setOpen] = createSignal<boolean>(false);

	return (
		<Dialog
			open={open()}
			onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<As
					component={Button}
					disabled={!props.has_session}
					variant="destructive"
					class="gap-2">
					Delete
					<IconTrash size={20} />
				</As>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Are you sure?</DialogTitle>
					<DialogDescription>
						This will irreversably delete every solve under this
						session.
					</DialogDescription>

					<DialogFooter>
						<Button
							variant="destructive"
							onClick={() => {
								setOpen(false);
								props.onDelete();
							}}>
							Delete
						</Button>
					</DialogFooter>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
