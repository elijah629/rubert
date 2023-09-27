import { Button } from "@/components/ui/button";
import { A } from "@solidjs/router";

export default function Navbar() {
	return (
		<>
			<header class="supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
				<div class="container flex h-14 items-center">
					<h1 class="font-bold">
						<img
							src="/icon.png"
							class="inline w-10 p-2"></img>
						<A href="/">Rubert</A>
					</h1>
					<nav class="flex flex-1 items-center justify-end">
						<a
							href="https://github.com/elijah629/rubert"
							target="_blank"
							rel="noreferrer">
							<Button
								variant="ghost"
								size="sm"
								class="w-9 px-0">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
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
									<path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"></path>
								</svg>
								<span class="sr-only">GitHub</span>
							</Button>
						</a>
					</nav>
				</div>
			</header>
		</>
	);
}
