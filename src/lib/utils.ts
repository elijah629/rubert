import { Solve } from "@/routes";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function clamp(val: number, min: number, max: number) {
	return val > max ? max : val < min ? min : val;
}

/// Gets the WCA average of N for a list of solves.
/// Throws if solves.length < n
/// Return false if the average is a DNF.
export function avg_of_n(solves: Solve[], n: number): number | false {
	if (solves.length < n) {
		throw new Error("N cannot be less than the number of solves");
	}

	const s = solves.slice(solves.length - n);

	s.sort((a, b) => {
		if (a.dnf) {
			return 1;
		}
		if (b.dnf) {
			return -1;
		}

		const a_time = a.time + (a.plus_2 ? 2000 : 0);
		const b_time = b.time + (b.plus_2 ? 2000 : 0);

		return a_time - b_time;
	});

	s.shift();
	s.pop();

	if (s.some(x => x.dnf)) {
		return false;
	}

	return s.map(x => x.time).reduce((a, b) => a + b) / s.length;
}
