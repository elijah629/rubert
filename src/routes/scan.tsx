import CubeNet from "@/components/CubeNet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cube, PartialCube, FaceletColor, facelet_color } from "@/lib/cube";
import { createSignal, For, onMount } from "solid-js";
import { scan_cube } from "@/lib/scanning";

export default function Scan() {
	let canvas!: HTMLCanvasElement;
	let video!: HTMLVideoElement;

	const [cube, setCube] = createSignal<PartialCube>({}, { equals: false });
	const [color, setColor] = createSignal<FaceletColor | null>(null);

	setCube(cube => {
		for (let i = 0; i <= 5; i++) {
			cube[i as FaceletColor] = [i, i, i, i, i, i, i, i, i];
		}
		return cube;
	});

	onMount(async () => {
    	const getUserMedia: typeof navigator.mediaDevices.getUserMedia =
	    	window.navigator.mediaDevices?.getUserMedia.bind(window.navigator.mediaDevices) ||
    		(window.navigator as any).webkitGetUserMedia ||
    		(window.navigator as any).mozGetUserMedia;

		const RES = 1000;

		const media = await getUserMedia({
			audio: false,
			video: {
				facingMode: "environment",
				aspectRatio: 1, // Not really required but it speeds up the algorithim by not having alot of unused side pixels
				width: { ideal: RES },
				height: { ideal: RES }
			}
		});
		video.srcObject = media;

		video.addEventListener("canplay", () => {
			const tmp_canvas = document.createElement("canvas");
			const ctx = tmp_canvas.getContext("2d", {
				willReadFrequently: true
			});

			tmp_canvas.height =
				canvas.height =
				video.height =
					video.videoHeight;
			tmp_canvas.width = canvas.width = video.width = video.videoWidth;

			const frame = new cv.Mat(
				video.videoHeight,
				video.videoWidth,
				cv.CV_8UC4
			);

			function update() {
				ctx?.drawImage(video, 0, 0);

				frame.data.set(
					ctx?.getImageData(0, 0, tmp_canvas.height, tmp_canvas.width)
						.data
				);

				const cube_partial = scan_cube(frame);
				if (cube_partial) {
					setCube({ ...cube(), ...cube_partial });
				}

				cv.imshow(canvas, frame);
				video.requestVideoFrameCallback(update);
			}

			video.requestVideoFrameCallback(update);
		});
	});

	return (
		<>
			<Card class="flex sm:flex-row flex-col sm:h-80 justify-between p-4">
				<canvas
					ref={canvas}
					class="rounded-md h-full w-auto border-2"></canvas>
				<video
					id="wci"
					class="rounded-md h-full w-auto border-2"
					playsinline
					autoplay
					muted
					ref={video}></video>
			</Card>
			<CubeNet
				value={cube()}
				onClick={(face, i) => {
					if (color() === null) {
						return;
					}

					setCube(cube => {
						cube[face]![i] = color();
						return cube;
					});
				}}
			/>
			<div class="flex items-end justify-between p-4">
				<Card class="grid grid-cols-3 grid-rows-2 gap-1 p-4">
					<For each={[...Array(6).keys()]}>
						{fcolor => {
							const [h, s, l] = facelet_color[fcolor as any];
							return (
								<div
									onClick={() => setColor(fcolor)}
									class={`h-10 w-10 rounded-sm text-destructive-foreground ring-offset-background transition-all hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
										color() === fcolor
											? "border-2 border-primary"
											: "border"
									}`}
									style={{
										background: `hsl(${h}deg, ${s}%, ${l}%)`
									}}></div>
							);
						}}
					</For>
				</Card>
				<Button
					onClick={() => {
						const cube_string = Cube.from_partial(cube())
							.wasm_facelets()
							.join("");
						window
							.open(
								`${window.origin}/solve/${cube_string}`,
								"_blank"
							)
							?.focus();
					}}>
					Solve
				</Button>
			</div>
		</>
	);
}
