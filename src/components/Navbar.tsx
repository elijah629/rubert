import { Button } from "@/components/ui/button";
import { A } from "@solidjs/router";
import { IconBrandGithub, IconBrandRust } from "@/lib/icons";

export default function Navbar() {
	return (
		<>
			<header class="supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
				<div class="container flex h-14 items-center">
					<A
						href="/"
						class="mr-6 flex items-center font-bold">
						<img
							alt=""
							src="/favicon.ico"
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
						<a href="https://github.com/elijah629/rubert/tree/main/solver">
							<Button
								variant="ghost"
								size="sm"
								aria-label="Rust"
								class="h-10 w-10 p-0">
								<IconBrandRust size={24} />
							</Button>
						</a>
						<a
							href="https://github.com/elijah629/rubert"
							target="_blank"
							rel="noreferrer">
							<Button
								variant="ghost"
								size="sm"
								aria-label="GitHub"
								class="h-10 w-10 p-0">
								<IconBrandGithub size={24} />
							</Button>
						</a>
					</div>
				</div>
			</header>
		</>
	);
}
