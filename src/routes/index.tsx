import { Card } from "@/components/ui/card";
import { A } from "@solidjs/router";

export default function Home() {
	return (
		<div class="flex flex-col items-center justify-center">
			<h1 class="m-2 text-2xl font-bold">
				How do you want to input the colors?
			</h1>
			<div class="flex flex-col gap-2 sm:flex-row">
				<A
					href="/scan"
					class="flex-1">
					<Card class="flex flex-col transition-colors hover:border-primary">
						<div class="p-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="m-auto h-24"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round">
								<path
									stroke="none"
									d="M0 0h24v24H0z"
									fill="none"></path>
								<path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2"></path>
								<path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
							</svg>
						</div>
						<div class="border-t-2 p-5">
							<h3 class="mb-1 text-2xl font-black">Scan</h3>
							<p class="text-sm text-muted-foreground">
								Use your camera to scan your cube
							</p>
						</div>
					</Card>
				</A>
				<A
					href="/manual"
					class="flex-1">
					<Card class="flex flex-col transition-colors hover:border-primary">
						<div class="p-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="m-auto h-24"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round">
								<path
									stroke="none"
									d="M0 0h24v24H0z"
									fill="none"></path>
								<path d="M2 6m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z"></path>
								<path d="M6 10l0 .01"></path>
								<path d="M10 10l0 .01"></path>
								<path d="M14 10l0 .01"></path>
								<path d="M18 10l0 .01"></path>
								<path d="M6 14l0 .01"></path>
								<path d="M18 14l0 .01"></path>
								<path d="M10 14l4 .01"></path>
							</svg>
						</div>
						<div class="border-t-2 p-5">
							<h3 class="text-2xl font-bold">Manual</h3>
							<p>Manually input the colors on your cube</p>
						</div>
					</Card>
				</A>
			</div>
		</div>
	);
}
