import { Move as CMove } from "@/lib/cube";

const moveMap: Record<CMove, string> = {
  [CMove.U1]: "/icons/U1.svg",
  [CMove.U2]: "/icons/U2.svg",
  [CMove.U3]: "/icons/U3.svg",
  [CMove.D1]: "/icons/D1.svg",
  [CMove.D2]: "/icons/D2.svg",
  [CMove.D3]: "/icons/D3.svg",
  [CMove.R1]: "/icons/R1.svg",
  [CMove.R2]: "/icons/R2.svg",
  [CMove.R3]: "/icons/R3.svg",
  [CMove.L1]: "/icons/L1.svg",
  [CMove.L2]: "/icons/L2.svg",
  [CMove.L3]: "/icons/L3.svg",
  [CMove.F1]: "/icons/F1.svg",
  [CMove.F2]: "/icons/F2.svg",
  [CMove.F3]: "/icons/F3.svg",
  [CMove.B1]: "/icons/B1.svg",
  [CMove.B2]: "/icons/B2.svg",
  [CMove.B3]: "/icons/B3.svg",
};
import { splitProps } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

export default function Move(
	props: { move: CMove } & Partial<
		JSX.IntrinsicElements & JSX.ImgHTMLAttributes<HTMLImageElement>
	>
) {
	const [local, others] = splitProps(props, ["move", "alt", "src"]);
	return (
		<img
			{...others}
			alt={CMove[props.move]
				.replace("1", "")
				.replace("2", " two")
				.replace("3", " prime")}
    	src={moveMap[local.move]}
    ></img>
	);
}
