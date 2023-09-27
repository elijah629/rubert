import { Card } from "@/components/ui/card";
import { A } from "@solidjs/router";

export default function Home() {
	return (
		<div class="flex flex-col items-center justify-center">
			<h1 class="m-2 text-2xl font-bold">
				How do you want to input the colors?
			</h1>
			<div class="flex flex-col gap-2 sm:flex-row">
				<A href="/scan">
					<Card class="flex max-w-sm flex-col items-center p-4 transition-colors hover:border-primary">
						<h3 class="text-2xl font-bold">Scan</h3>
						<p>Use your camera to scan your cube</p>
					</Card>
				</A>
				<A href="/manual">
					<Card class="flex max-w-sm flex-col items-center p-4 transition-colors hover:border-primary">
						<h3 class="text-2xl font-bold">Manual</h3>
						<p>Manually input the colors on your cube</p>
					</Card>
				</A>
			</div>
		</div>
	);
}
