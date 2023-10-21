import { For } from "solid-js";
import { Card } from "@/components/ui/card";
import { FaceletColor, facelet_hsl } from "@/lib/cube";

export default function ColorPicker(props: {
	value: FaceletColor | null;
	onChange: (value: FaceletColor) => void;
}) {
	return (
		<Card class="grid grid-cols-3 grid-rows-2 gap-1 p-4">
			<For each={[...Array(6).keys()]}>
				{fcolor => {
					const [h, s, l] = facelet_hsl.get(fcolor)!;
					return (
						<div
							onClick={() => props.onChange(fcolor)}
							class={`h-10 w-10 rounded-sm text-destructive-foreground ring-offset-background transition-all hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
								props.value === fcolor
									? "border-2 border-primary"
									: "border"
							}`}
							style={{
								background: `hsl(${h}deg, ${s}%, ${l}%)`
							}}></div>
					);
				}}
			</For>
		</Card>
	);
}
