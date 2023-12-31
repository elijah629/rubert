import { FaceletColor, Face, Cube } from "@/lib/cube";
export namespace cv {
	export type Point = InstanceType<typeof window.cv.Point>;
	export type Mat = InstanceType<typeof window.cv.Mat>;
	export type Rect = InstanceType<typeof window.cv.Rect>;
	export type RotatedRect = InstanceType<typeof window.cv.RotatedRect>;
}

// [0-180, 0-255, 0-255]
function hsv_to_facelet(color: [number, number, number]): FaceletColor | null {
	// [H, S, V] bounds
	const face_colors: [
		FaceletColor,
		[[number, number, number], [number, number, number]][]
	][] = [
		// Color: [ [MIN, MAX], [MIN, MAX], ... ]
		[
			FaceletColor.Green,
			[
				[
					[70, 100, 0],
					[95, 255, 255]
				]
			]
		],
		[
			FaceletColor.Blue,
			[
				[
					[106, 100, 0],
					[120, 255, 255]
				]
			]
		],
		[
			FaceletColor.Red,
			[
				[
					[0, 100, 0],
					[8, 255, 255]
				],
				[
					[175, 100, 0],
					[180, 255, 255]
				]
			]
		],
		[
			FaceletColor.Orange,
			[
				[
					[9, 60, 0],
					[20, 255, 255]
				]
			]
		],
		[
			FaceletColor.Yellow,
			[
				[
					[25, 60, 0],
					[45, 255, 255]
				]
			]
		],
		[
			FaceletColor.White,
			[
				[
					[0, 0, 70],
					[180, 255, 255]
				]
			]
		]
	];

	return (
		face_colors.find(([_, ranges]) => {
			let in_one_range = false;
			for (const [min, max] of ranges) {
				let in_range = true;

				for (let i = 0; i < 3; i++) {
					in_range &&= min[i] <= color[i] && max[i] >= color[i];
				}
				in_one_range ||= in_range;
			}

			return in_one_range;
		})?.[0] ?? null
	);
}

/*function rank_TBLR(point: cv.Point, width: number, max_diff: number): number {
	return Math.floor(point.y / max_diff) * max_diff * width + point.x;
}

function sort_distance(
	a: cv.Point,
	b: cv.Point,
	referencePoint: cv.Point
): number {
	// Calculate the distance between pointA and the reference point
	const distanceA = Math.sqrt(
		Math.pow(a.x - referencePoint.x, 2) +
			Math.pow(a.y - referencePoint.y, 2)
	);
	// Calculate the distance between pointB and the reference point
	const distanceB = Math.sqrt(
		Math.pow(b.x - referencePoint.x, 2) +
			Math.pow(b.y - referencePoint.y, 2)
	);

	// Sort based on the distances
	return distanceA - distanceB;
}

function rotate_points(angle: number, center: cv.Point, points: cv.Point[]) {
	const s = Math.sin(angle);
	const c = Math.cos(angle);

	for (let i = 0; i < points.length; i++) {
		const x = points[i].x - center.x;
		const y = points[i].y - center.y;
		(points[i].x = c * x + s * y + center.x),
			(points[i].y = c * y - s * x + center.y);
	}
}*/

/**
 * Mutates {frame}, and adds squares surrounding cube facelets to it
 * Returns a partial cube of the new information, or false if it did
 * not gain any information. It is the callers job to merge all them
 * information into a full cube and check for completeness.
 *
 * @param {cv.Mat} frame
 * @returns {false | Cube}
 * */
export function scan_cube(frame: cv.Mat): false | Cube {
	const out = new cv.Mat();
	cv.cvtColor(frame, out, cv.COLOR_RGB2GRAY);
	cv.GaussianBlur(out, out, new cv.Size(5, 5), 0);
	cv.Canny(out, out, 10, 40);
	cv.dilate(out, out, cv.Mat.ones(3, 3, cv.CV_8UC1));

	const contours = new cv.MatVector();
	const hierarchy = out;
	cv.findContours(
		out,
		contours,
		hierarchy,
		cv.RETR_CCOMP,
		cv.CHAIN_APPROX_SIMPLE
	);

	const squares: [cv.RotatedRect, cv.Rect, number][] = [];

	// [next, previous, first_child, parent] repeating
	const data = hierarchy.data32S;
	for (let i = 0; i < data.length; i += 4) {
		// Only go over contours without children
		const has_child = data[i + 2] !== -1;
		if (has_child) {
			continue;
		}

		//const current_contour = i;
		const current_contour = data[i + 1] + 1; // previous + 1 will be current contour, even if it is -1.

		// Filter contours for close-to-perfect squares;
		const contour = contours.get(current_contour);
		const perimeter = cv.arcLength(contour, true);

		const approx = new cv.Mat();
		cv.approxPolyDP(contour, approx, 0.02 * perimeter, true);

		const sides = approx.total();
		if (sides === 4) {
			const rect = cv.minAreaRect(approx);
			const area = cv.contourArea(contour);
			const ratio = rect.size.width / rect.size.height;

			if (
				ratio >= 0.6 && // Perfect square: 1
				ratio <= 1.3 &&
				rect.size.width > 20 && // Remove small squares from noise
				area / (rect.size.width * rect.size.height) > 0.4 // For a perfect square: 1.0
			) {
				squares.push([rect, cv.boundingRect(approx), area]);
			}
		}
		contour.delete();
		approx.delete();
	}
	contours.delete();
	hierarchy.delete();

	// Remove outliers
	const calc_median = () => {
		let total = 0;

		for (const [_, _0, area] of squares) {
			total += area;
		}

		return total / squares.length;
	};

	const half_median = calc_median() / 2;
	for (let i = 0; i < squares.length; i++) {
		if (squares[i][2] < half_median) {
			squares.splice(i, 1);
		}
	}

	const double_median = calc_median() * 2;
	for (let i = 0; i < squares.length; i++) {
		if (squares[i][2] > double_median) {
			squares.splice(i, 1);
		}
	}

	let cube_partial: Cube | null = null;

	if (squares.length === 9) {
		// Find avg_rot and avg_center
		/*	const avg_rot =
			squares.map(x => x[0].angle - 90).reduce((a, b) => a + b) / 9;
		const acc_center = squares
			.map(x => x[0].center)
			.reduce((a, b) => new cv.Point(b.x + a.x, b.y + a.y));
		const avg_center = new cv.Point(acc_center.x / 9, acc_center.y / 9);

		let top_left = new cv.Point(0, 0);

		for (const square of squares) {
			const x = square[0].center.x - square[0].size.width / 2;
			const y = square[0].center.y - square[0].size.height / 2;

			top_left.x = Math.min(top_left.x, x);
			top_left.y = Math.min(top_left.y, y);
		}*/

		// Rotate Rect's center points originied on avg_center by (avg_rot - 90)
		/*
		let rotated = squares.map(
			x => new cv.Point(x[0].center.x, x[0].center.y)
		);
		rotate_points(avg_rot, avg_center, rotated);


		// Row match, sort row L - R, Sort all rows T - B
		const RANGE = 40;
		const sorted: [cv.Point, number][][] = [];
		for (const a of rotated) {
		   const row: [cv.Point, number][] = [];

		   const max = a.y + RANGE;
		   const min = a.y - RANGE;

		   for (let i = 0; i < squares.length; i++) {
				const b = rotated[i];
				if (b.y <= max && b.y >= min) {
				    row.push([b, i]);
				}
		   } 

		   // Left to right
		   row.sort((a, b) => a[0].x - b[0].x);

		   sorted.push(row);
		}

		// Top to bottom
		sorted.sort((a, b) => a[0][0].y - b[0][0].y);
		
		const flat_sorted = sorted.flat();
		console.log(flat_sorted);

		for (let i = 0; i < squares.length; i++) {
		    const to = flat_sorted[i][1];
		
			squares[i] = squares[to];
		}
*/
		// Rect -> Image -> Average -> HSV -> FaceletColor

		const facelets: FaceletColor[] = Array.from({ length: 9 });
		for (let i = 0; i < squares.length; i++) {
			const rect = squares[i][0];
			const rect_bounds = squares[i][1];

			const angle = rect.angle < -45.0 ? rect.angle + 90 : rect.angle;

			const bounds_roi = frame.roi(rect_bounds);
			const center = new cv.Point(
				bounds_roi.cols / 2,
				bounds_roi.rows / 2
			);
			const rot_mat = cv.getRotationMatrix2D(center, angle, 1);

			const rotated = new cv.Mat();
			cv.warpAffine(
				bounds_roi,
				rotated,
				rot_mat,
				new cv.Size(bounds_roi.cols, bounds_roi.rows)
			);
			rot_mat.delete();

			const cropped = rotated.roi(
				new cv.Rect(
					Math.min(
						0,
						center.x - rect.size.width / 2 + rect.size.width / 3
					),
					Math.min(
						0,
						center.y - rect.size.height / 2 + rect.size.height / 3
					),
					Math.min(rotated.cols, (rect.size.width * 2) / 3),
					Math.min(rotated.rows, (rect.size.height * 2) / 3)
				)
			);

			bounds_roi.delete();

			const average = new cv.Mat(1, 1, cv.CV_8UC3, cv.mean(cropped));
			cropped.delete();

			cv.cvtColor(average, average, cv.COLOR_RGB2HSV);

			const facelet = hsv_to_facelet(average.data);
			average.delete();

			if (facelet === null) {
				return false; // At least one square could not be found
			}

			facelets[i] = facelet;
		}

		cube_partial = new Map([[facelets[4], facelets as Face]]);
	}

	for (const [rect] of squares) {
		const vertices = (cv.RotatedRect as any).points(rect);

		for (let i = 0; i < 4; i++) {
			cv.line(
				frame,
				vertices[i],
				vertices[(i + 1) % 4],
				new cv.Scalar(255, 255, 255, 255),
				10
			);
		}
	}

	return cube_partial ?? false;
}
