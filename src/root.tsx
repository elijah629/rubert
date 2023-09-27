// @refresh reload
import { Suspense } from "solid-js";
import {
	Body,
	ErrorBoundary,
	FileRoutes,
	Head,
	Html,
	Meta,
	Routes,
	Scripts,
	Title
} from "solid-start";
import Navbar from "./components/navbar";
import { Toaster } from "./components/ui/toast";
import "./root.css";

export default function Root() {
	return (
		<Html lang="en">
			<Head>
				<Title>Rubert - The fastest rubiks cube solver</Title>
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
						<Toaster />
					</ErrorBoundary>
				</Suspense>
				<script src="/js/opencv.js"></script>
				<Scripts />
			</Body>
		</Html>
	);
}
