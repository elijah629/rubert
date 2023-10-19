import ColorPicker from "@/components/ColorPicker";
import SolveButton from "@/components/SolveButton";
import { FaceletColor } from "@/lib/cube";
import { createSignal, onCleanup, onMount } from "solid-js";
import * as THREE from "three";
import { OrbitControls } from "@/lib/orbitcontrols";

const facelet_rgb: Record<FaceletColor | any, [number, number, number]> = {
	[FaceletColor.Red]: [255, 0, 0],
	[FaceletColor.Orange]: [255, 165, 0],
	[FaceletColor.Blue]: [0, 0, 255],
	[FaceletColor.Green]: [0, 255, 0],
	[FaceletColor.White]: [255, 255, 255],
	[FaceletColor.Yellow]: [255, 255, 0]
};

export default function InteractiveCube() {
	let canvas!: HTMLCanvasElement;

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

	onMount(() => {
		{
			const cpe = canvas.parentElement!;
			canvas.width = cpe.clientWidth;
			canvas.height = cpe.clientHeight;
		}

		const raycaster = new THREE.Raycaster();
		const pointer = new THREE.Vector2();

		canvas.addEventListener("mousemove", event => {
			let canvasBounds = canvas.getBoundingClientRect();
			pointer.x =
				((event.clientX - canvasBounds.left) /
					(canvasBounds.right - canvasBounds.left)) *
					2 -
				1;
			pointer.y =
				-(
					(event.clientY - canvasBounds.top) /
					(canvasBounds.bottom - canvasBounds.top)
				) *
					2 +
				1;
		});

		const renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			antialias: true,
			alpha: true
		});
		const camera = new THREE.PerspectiveCamera(
			75,
			canvas.width / canvas.height,
			0.1,
			15
		);

		camera.position.z = camera.position.y = camera.position.x = 3;

		{
			const resize = () => {
				const cpe = canvas.parentElement!;
				canvas.width = cpe.clientWidth;
				canvas.height = cpe.clientHeight;

				camera.aspect = canvas.width / canvas.height;
				camera.updateProjectionMatrix();

				renderer.setSize(canvas.width, canvas.height);
			};
			window.addEventListener("resize", resize);
			onCleanup(() => {
				window.removeEventListener("resize", resize);
			});
		}

		const scene = new THREE.Scene();

		const geometry = new THREE.BoxGeometry(3, 3, 3, 3, 3, 3).toNonIndexed();
		const material = new THREE.MeshBasicMaterial({
			vertexColors: true
			// wireframe: true
		});

		const colors = new Uint8Array(
			geometry.attributes.position.count * 3
		).fill(255);

		for (let i = 0; i < 6; i++) {
			for (let j = 0; j < 9; j++) {
				const x = j + 9 * i;
				const rgb = facelet_rgb[cube().get(i)![j]];
				for (const i of Array.from(
					{ length: 3 * 2 },
					(_, i) => i + x * 6
				)) {
					colors[i * 3 + 0] = rgb[0];
					colors[i * 3 + 1] = rgb[1];
					colors[i * 3 + 2] = rgb[2];
				}
			}
		}
		geometry.setAttribute(
			"color",
			new THREE.BufferAttribute(colors, 3, true)
		);

		{
			const mesh = new THREE.Mesh(geometry, material);
			mesh.rotateX(-Math.PI / 2);
			mesh.rotateZ(-Math.PI / 2);
			scene.add(mesh);
		}

		const light = new THREE.DirectionalLight(0xffffff, 3);
		scene.add(light);

		{
			const controls = new OrbitControls(camera, renderer.domElement);

			controls.maxDistance = 13;
			controls.minDistance = 4;
			controls.enablePan = false;
		}

		canvas.addEventListener("click", () => {
			if (color() === null) {
				return;
			}
			raycaster.setFromCamera(pointer, camera);
			const intersects = raycaster.intersectObjects(scene.children);
			const colors = geometry.getAttribute("color").array;

			for (let i = 0; i < intersects.length; i++) {
				const faceIndex = intersects[i]?.faceIndex!;
				const face = Math.floor(Math.floor(faceIndex / 2) / 9);
				const facelet = [6, 7, 4, 1, 2, 3, 0, 5, 8][
					Math.floor(faceIndex / 2) % 9
				];

				setCube(cube => {
					const new_face = cube.get(face)!;
					new_face[facelet] = color()!;
					cube.set(face, new_face);

					return cube;
				});

				const rgb = facelet_rgb[color()!];
				const x = Math.floor(faceIndex / 2);
				for (const i of Array.from(
					{ length: 3 * 2 },
					(_, i) => i + x * 6
				)) {
					colors[i * 3 + 0] = rgb[0];
					colors[i * 3 + 1] = rgb[1];
					colors[i * 3 + 2] = rgb[2];
				}
			}

			geometry.setAttribute(
				"color",
				new THREE.BufferAttribute(colors, 3, true)
			);
		});

		function render() {
			light.position.set(
				camera.position.x,
				camera.position.y,
				camera.position.z
			);

			renderer.render(scene, camera);

			window.requestAnimationFrame(render);
		}
		window.requestAnimationFrame(render);
	});

	return (
		<>
			<div class="flex-1">
				<canvas ref={canvas}></canvas>
			</div>
			<div class="flex items-end justify-between p-4">
				<ColorPicker
					value={color()}
					onChange={setColor}
				/>
				<SolveButton cube={cube()} />
			</div>
		</>
	);
}
