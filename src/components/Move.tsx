import { Move as CMove } from "@/lib/cube";

import U1 from "@/icons/U1.svg";
import U2 from "@/icons/U2.svg";
import U3 from "@/icons/U3.svg";
import D1 from "@/icons/D1.svg";
import D2 from "@/icons/D2.svg";
import D3 from "@/icons/D3.svg";
import R1 from "@/icons/R1.svg";
import R2 from "@/icons/R2.svg";
import R3 from "@/icons/R3.svg";
import L1 from "@/icons/L1.svg";
import L2 from "@/icons/L2.svg";
import L3 from "@/icons/L3.svg";
import F1 from "@/icons/F1.svg";
import F2 from "@/icons/F2.svg";
import F3 from "@/icons/F3.svg";
import B1 from "@/icons/B1.svg";
import B2 from "@/icons/B2.svg";
import B3 from "@/icons/B3.svg";

export default function Move(props: { move: CMove }) {
	return (
		<img
			alt={CMove[props.move]
				.replace("1", "")
				.replace("2", " two")
				.replace("3", " prime")}
			src={
				[
					U1,
					U2,
					U3,
					D1,
					D2,
					D3,
					R1,
					R2,
					R3,
					L1,
					L2,
					L3,
					F1,
					F2,
					F3,
					B1,
					B2,
					B3
				][props.move]
			}></img>
	);
}
