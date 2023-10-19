import CubeNet from "@/components/CubeNet";
import { Card } from "@/components/ui/card";
import { FaceletColor } from "@/lib/cube";
import { createEffect, createSignal, on, onMount } from "solid-js";
import { scan_cube } from "@/lib/scanning";
import SolveButton from "@/components/SolveButton";
import ColorPicker from "@/components/ColorPicker";
import { useIsRouting } from "solid-start";

export default function Scan() {
	let canvas!: HTMLCanvasElement;
	let video!: HTMLVideoElement;

	const isRouting = useIsRouting();

	createEffect(
		on(isRouting, () => {
			const stream = video.srcObject as MediaStream | null;
			const tracks = stream?.getTracks();

			if (!tracks) {
				return;
			}

			for (const track of tracks) {
				track.stop();
			}
		})
	);

	const [cube, setCube] = createSignal<Map<FaceletColor, FaceletColor[]>>(
		new Map(),
		{ equals: false }
	);
	const [color, setColor] = createSignal<FaceletColor | null>(null);

	setCube(cube => {
		for (let i = 0; i <= 5; i++) {
			cube.set(i as FaceletColor, Array(9).fill(i));
		}
		return cube;
	});

	onMount(async () => {
		const getUserMedia: typeof navigator.mediaDevices.getUserMedia =
			window.navigator.mediaDevices?.getUserMedia.bind(
				window.navigator.mediaDevices
			) ||
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
			<script
				type="text/javascript"
				src="/js/opencv.js"></script>
			<Card class="mb-4 flex flex-col justify-between p-4 sm:h-80 sm:flex-row">
				<canvas
					ref={canvas}
					class="w-auto rounded-md border-2"></canvas>
				<video
					id="wci"
					class="h-full w-auto rounded-md border-2"
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
						const new_face = cube.get(face)!;
						new_face[i] = color()!;
						cube.set(face, new_face);
						return cube;
					});
				}}
			/>
			<div class="flex items-end justify-between p-4">
				<ColorPicker
					value={color()}
					onChange={x => setColor(x)}
				/>
				<SolveButton cube={cube()} />
			</div>
		</>
	);
}
