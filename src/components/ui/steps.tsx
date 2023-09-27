import { createSignal, JSX } from "solid-js";
import { Button } from "./button";

interface StepProps {
	steps: Step[];
}

interface Step {
	/**
	 * Displayed at the top of the page for a longer description
	 */
	title: string;
	/**
	 * Displayed on the button pointing to this step
	 */
	short_name: string;
	/**
	 * Actual content of the step
	 */
	children: JSX.Element;
}

export function Steps(props: StepProps) {
	if (props.steps.length === 0) {
		throw new Error("props.steps cannot be empty");
	}

	const [step, setStep] = createSignal<number>(0);

	return (
		<div class="container">
			<h1 class="text-3xl font-bold">{props.steps[step()].title}</h1>
			<div>{props.steps[step()].children}</div>
			<div class="flex justify-between">
				<span>
					{step() !== 0 && (
						<Button onClick={() => setStep(step => step - 1)}>
							{props.steps[step() - 1].short_name}
						</Button>
					)}
				</span>
				<span>
					{step() !== props.steps.length - 1 && (
						<Button onClick={() => setStep(step => step + 1)}>
							{props.steps[step() + 1].short_name}
						</Button>
					)}
				</span>
			</div>
		</div>
	);
}
