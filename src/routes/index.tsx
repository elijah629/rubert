import { Card } from "@/components/ui/card";
import { A } from "@solidjs/router";
import { JSX } from "solid-js";
import styles from "./index.module.css";

function OptionCard(props: {href: string, icon: JSX.Element, title: string, description: string}) {
    return <A
					href={props.href}
					class="flex-1">
					<Card class={styles.option}>
						<div class={styles.option_icon_container}>
<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-20"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round">
								{props.icon}
							</svg>
						</div>
						<div class="border-t-2 p-5">
							<h3 class="text-2xl font-black">{props.title}</h3>
							<p class="text-sm text-muted-foreground">
								{props.description}
							</p>
						</div>
					</Card>
				</A>;
}

export default function Home() {
	return (
		<div class="flex flex-col items-center justify-center">
			<h1 class="m-4 text-2xl font-bold">
				How do you want to input the colors?
			</h1>
			<div class="flex flex-col gap-2 sm:flex-row">
			<OptionCard href="/scan" title="Scan" description="Use your camera to scan your cube" icon={<>
			<path d="M5 7h1a2 2 0 0 0 2-2 1 1 0 0 1 1-1h6a1 1 0 0 1 1 1 2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2"/><path d="M9 13a3 3 0 1 0 6 0 3 3 0 0 0-6 0"/>
			</>}/>
			<OptionCard href="/manual" title="Manual" description="Manually input the colors on your cube" icon={<>
			<path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM6 10h0M10 10h0M14 10h0M18 10h0M6 14h0M18 14h0M10 14h4"/>
			</>}/>
			</div>
		</div>
	);
}
