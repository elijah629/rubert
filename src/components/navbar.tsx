import { TbBrandGithub } from "solid-icons/tb";
import { Button } from "@/components/ui/button";
import { A } from "@solidjs/router";

export default function Navbar() {
	return (
		<>
			<header class="supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
				<div class="container flex h-14 items-center">
					<A
						href="/"
						class="mr-6 flex items-center font-bold">
						<img
							src="/icon.png"
							class="inline h-10 w-10 p-2"></img>
						Rubert
					</A>
					<nav class="flex items-center text-sm font-bold">
						<A
							href="/solver"
							class="text-foreground/60 transition-colors hover:text-foreground/80">
							Solver
						</A>
					</nav>
					<div class="flex flex-1 items-center justify-end">
						<a
							href="https://github.com/elijah629/rubert"
							target="_blank"
							rel="noreferrer">
							<Button
								variant="ghost"
								size="sm"
								class="w-9 px-0">
								<TbBrandGithub size={24} />
								<span class="sr-only">GitHub</span>
							</Button>
						</a>
					</div>
				</div>
			</header>
		</>
	);
}
