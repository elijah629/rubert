// This file will remain here until solid-icons is fixed to work with solid@^1.8.0
// Icons from tabler icons

import { Component, JSX, splitProps } from "solid-js";

export interface IconProps
	extends Partial<
		JSX.IntrinsicElements & JSX.SvgSVGAttributes<SVGSVGElement>
	> {
	size?: string | number;
}

function I(children: () => JSX.Element): Component<IconProps> {
	return props => {
		const [local, others] = splitProps(props, ["size"]);
		return (
			<svg
				ref={props.ref}
				xmlns="http://www.w3.org/2000/svg"
				stroke-width="2"
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				{...others}
				viewBox="0 0 24 24"
				width={local.size ?? "1em"}
				height={local.size ?? "1em"}>
				{children()}
			</svg>
		);
	};
}

export const IconPlus = I(() => <path d="M12 5v14m-7-7h14" />);
export const IconTrash = I(() => (
	<path d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
));

export const IconBrandRust = I(() => (
	<>
		<path d="M10.139 3.463c.473 -1.95 3.249 -1.95 3.722 0a1.916 1.916 0 0 0 2.859 1.185c1.714 -1.045 3.678 .918 2.633 2.633a1.916 1.916 0 0 0 1.184 2.858c1.95 .473 1.95 3.249 0 3.722a1.916 1.916 0 0 0 -1.185 2.859c1.045 1.714 -.918 3.678 -2.633 2.633a1.916 1.916 0 0 0 -2.858 1.184c-.473 1.95 -3.249 1.95 -3.722 0a1.916 1.916 0 0 0 -2.859 -1.185c-1.714 1.045 -3.678 -.918 -2.633 -2.633a1.916 1.916 0 0 0 -1.184 -2.858c-1.95 -.473 -1.95 -3.249 0 -3.722a1.916 1.916 0 0 0 1.185 -2.859c-1.045 -1.714 .918 -3.678 2.633 -2.633a1.914 1.914 0 0 0 2.858 -1.184z"></path>
		<path d="M8 12h6a2 2 0 1 0 0 -4h-6v8v-4z"></path>
		<path d="M19 16h-2a2 2 0 0 1 -2 -2a2 2 0 0 0 -2 -2h-1"></path>
		<path d="M9 8h-4"></path>
		<path d="M5 16h4"></path>
	</>
));
export const IconX = I(() => (
	<>
		<path d="M18 6l-12 12"></path>
		<path d="M6 6l12 12"></path>
	</>
));
export const IconCheck = I(() => <path d="M5 12l5 5l10 -10"></path>);
export const IconChevronDown = I(() => <path d="M6 9l6 6l6 -6"></path>);
export const IconChevronRight = I(() => <path d="M9 6l6 6l-6 6"></path>);
export const IconCircle = I(() => (
	<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
));
export const IconRefresh = I(() => (
	<>
		<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
		<path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
	</>
));
export const IconCamera = I(() => (
	<>
		<path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2"></path>
		<path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
	</>
));
export const IconCube = I(() => (
	<>
		<path d="M21 16.008v-8.018a1.98 1.98 0 0 0 -1 -1.717l-7 -4.008a2.016 2.016 0 0 0 -2 0l-7 4.008c-.619 .355 -1 1.01 -1 1.718v8.018c0 .709 .381 1.363 1 1.717l7 4.008a2.016 2.016 0 0 0 2 0l7 -4.008c.619 -.355 1 -1.01 1 -1.718z"></path>
		<path d="M12 22v-10"></path>
		<path d="M12 12l8.73 -5.04"></path>
		<path d="M3.27 6.96l8.73 5.04"></path>
	</>
));
export const IconKeyboard = I(() => (
	<>
		<path d="M2 6m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z"></path>
		<path d="M6 10l0 .01"></path>
		<path d="M10 10l0 .01"></path>
		<path d="M14 10l0 .01"></path>
		<path d="M18 10l0 .01"></path>
		<path d="M6 14l0 .01"></path>
		<path d="M18 14l0 .01"></path>
		<path d="M10 14l4 .01"></path>
	</>
));
export const IconDownload = I(() => (
	<>
		<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>
		<path d="M7 11l5 5l5 -5"></path>
		<path d="M12 4l0 12"></path>
	</>
));
export const IconBrandGithub = I(() => (
	<path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"></path>
));
export const IconFreezeColumn = I(() => (
	<>
		<path d="M9 9.5l-6 6"></path>
		<path d="M9 4l-6 6"></path>
		<path d="M9 15l-5 5"></path>
		<path d="M9 3v18"></path>
		<path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z"></path>
	</>
));
export const IconDots = I(() => (
	<>
		<path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
		<path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
		<path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
	</>
));
