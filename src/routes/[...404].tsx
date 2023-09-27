import { A } from "@solidjs/router";
import { Title } from "solid-start";
import { HttpStatusCode } from "solid-start/server";

export default function NotFound() {
	return (
		<>
			<Title>Not Found</Title>
			<HttpStatusCode code={404} />
			<h1>(Insert the word LOST made with Rubik's cubes)</h1>
			<A href="/">Get outta here</A>
		</>
	);
}
