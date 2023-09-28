import { A } from "@solidjs/router";
import { Title } from "solid-start";
import { HttpStatusCode } from "solid-start/server";

export default function NotFound() {
	return (
		<>
			<Title>Not Found</Title>
			<HttpStatusCode code={404} />
			<p>Not found, womp womp</p>
			<A href="/" class="font-medium underline underline-offset-4">Get outta here</A>
		</>
	);
}
