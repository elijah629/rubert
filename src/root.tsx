// @refresh reload
import { Suspense } from "solid-js";
import {
	Body,
	ErrorBoundary,
	FileRoutes,
	Head,
	Html,
	Link,
	Meta,
	Routes,
	Scripts,
	Title
} from "solid-start";
import Navbar from "./components/navbar";
import "./root.css";

export default function Root() {
	return (
		<Html lang="en">
			<Head>
				<Title>Rubert - The fastest 3x3x3 Rubik's cube solver and timer</Title>
				<Link
					rel="icon"
					href="favicon.ico"
				/>
				<Meta charset="utf-8" />
				<Meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
			</Head>
			<Body class="container flex h-full flex-col">
				<Suspense>
					<ErrorBoundary>
						<Navbar />
						<Routes>
							<FileRoutes />
						</Routes>
					</ErrorBoundary>
				</Suspense>
				<Scripts />
			</Body>
		</Html>
	);
}
