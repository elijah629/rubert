import { Card } from "@/components/ui/card";
import { A } from "@solidjs/router";
import styles from "./solver.module.css";
import { IconCamera, IconCube, IconKeyboard, IconProps } from "@/lib/icons";
import { Component } from "solid-js";

function OptionCard(props: {
	href: string;
	icon: Component<IconProps>;
	title: string;
	description: string;
}) {
	return (
		<A
			href={props.href}
			class="flex-1">
			<Card class={styles.option}>
				<div class={styles.option_icon_container}>
					<props.icon size={80} />
				</div>
				<div class="border-t-2 p-5">
					<span class="text-2xl font-black">{props.title}</span>
					<p class="text-sm text-muted-foreground">
						{props.description}
					</p>
				</div>
			</Card>
		</A>
	);
}

export default function Home() {
	return (
		<div class="flex flex-col items-center justify-center">
			<h1 class="m-4 text-2xl font-bold">
				How do you want to input the colors?
			</h1>
			<div class="flex flex-col gap-2 sm:flex-row">
				<OptionCard
					href="/solver/scan"
					title="Scan"
					description="Use your camera to scan your cube"
					icon={IconCamera}
				/>
				<OptionCard
					href="/solver/manual"
					title="Manual"
					description="Manually input the colors on your cube"
					icon={IconKeyboard}
				/>
				<OptionCard
					href="/solver/3d"
					title="3D"
					description="Input colors on a 3D model"
					icon={IconCube}
				/>
			</div>
		</div>
	);
}
