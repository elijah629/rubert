import { Move as CMove } from "@/lib/cube";
import { For, Show, createEffect, createMemo, createSignal, on, onMount } from "solid-js";
import * as idb from "idb";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { TbDots, TbFreezeColumn, TbRefresh } from "solid-icons/tb";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import init, { generate_scramble } from "@/solver/solver";
import Move from "@/components/Move";
import { As } from "@kobalte/core";
import { Card } from "@/components/ui/card";
import NewSessionButton from "@/components/NewSessionButton";
import DeleteSessionButton from "@/components/DeleteSessionButton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroupLabel,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuRadioItem,
	DropdownMenuRadioGroup
} from "@/components/ui/dropdown-menu";
import { avg_of_n, cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/seperator";

export interface Solve {
	time: number;
	dnf: boolean;
	plus_2: boolean;
	scramble: CMove[];
}

interface Session {
	solves: Solve[];
}

function format_stopwatch(ms: number): string {
	const dt = new Date(ms);
	const ms_2 = ((dt.getMilliseconds() / 10) | 0).toString().padStart(2, "0");
	const seconds = dt.getSeconds().toString().padStart(2, "0");
	const minutes = dt.getMinutes();

	return `${minutes}:${seconds}.${ms_2}`;
}

export default function Timer() {
	const [sessions, setSessions] = createSignal<Record<string, Session>>(
		{},
		{ equals: false }
	);
	const [session, setSession] = createSignal<string>();
	const [scramble, setScramble] = createSignal<CMove[]>();
	const [elapsed, setElapsed] = createSignal<number>();
	const [running, setStarted] = createSignal<boolean>(false);
	const [scrambleIcons, setScrambleIcons] = createSignal<boolean>(true);

	const c_session = () => sessions()[session()!];

	let start_time = null;
	const newScramble = async () => {
		await init();

		setScramble(Array.from(generate_scramble(20)));
	};

	const update_timer = () => {
		const elapsed = Date.now() - start_time!;
		setElapsed(elapsed);

		if (running()) {
			window.requestAnimationFrame(update_timer);
		}
	};

	onMount(newScramble);

	const timer_toggle = () => {
		if (!session()) {
			return;
		}
		setStarted(!running());
		if (running()) {
			window.requestAnimationFrame(update_timer);
			start_time = Date.now();
		} else {
			setSessions(sessions => {
				const current = c_session();
				current.solves.push({
					time: elapsed()!,
					scramble: scramble()!,
					dnf: false,
					plus_2: false
				});

				newScramble();
				return sessions;
			});
		}
	};

	// onMount can't work because we would need to put a createEffect inside of an onMount and that disables destruction
	if (typeof window !== "undefined") {
		let can_update = false;

		const db = idb.openDB("timer-db", 1, {
			upgrade(db) {
				db.createObjectStore("sessions");
			}
		});

		const update = async () => {
			if (!can_update) {
				return;
			}
			const tx = (await db).transaction("sessions", "readwrite");
			const store = tx.objectStore("sessions");

			for (const key of await store.getAllKeys()) {
				store.delete(key);
			}

			for (const [name, session] of Object.entries(sessions())) {
				store.add(session, name);
			}

			tx.commit();
		};

		createEffect(on(sessions, update));
		onMount(async () => {
			const tx = (await db).transaction("sessions", "readonly");
			const store = tx.objectStore("sessions");

			const k: string[] = (await store.getAllKeys()) as string[];
			const v: Session[] = await store.getAll();

			const entries: [string, Session][] = k.map((k, i) => [k, v[i]]);

			setSessions(Object.fromEntries(entries));
			can_update = true;
		});
	}

	return (
		<div class="mt-2 flex flex-1 flex-col gap-2">
			<Card class="flex flex-col gap-2 p-4">
				<div class="flex items-center gap-2">
					<Sheet>
						<SheetTrigger asChild>
							<As
								component={Button}
								size="sm"
								class="gap-2">
								Sessions
								<TbFreezeColumn size={24} />
							</As>
						</SheetTrigger>
						<SheetContent
							position="left"
							size="content">
							<SheetHeader>
								<SheetTitle>Sessions</SheetTitle>
								<SheetDescription>
									Manage your sessions
								</SheetDescription>
							</SheetHeader>

							<div class="flex flex-col gap-2">
								<div class="flex flex-wrap gap-2">
									<Select
										value={session()}
										onChange={setSession}
										options={Object.keys(sessions())}
										placeholder="Select a session…"
										itemComponent={props => (
											<SelectItem item={props.item}>
												{props.item.rawValue}
											</SelectItem>
										)}>
										<SelectTrigger
											aria-label="Session"
											class="w-[180px]">
											<SelectValue<string>>
												{state =>
													state.selectedOption()
												}
											</SelectValue>
										</SelectTrigger>
										<SelectContent />
									</Select>
									<NewSessionButton
										onCreate={x => {
											setSessions({
												...sessions(),
												[x]: { solves: [] }
											});
											setSession(x);
										}}
									/>
									<DeleteSessionButton
										has_session={!!session()}
										onDelete={() => {
											setSessions(sessions => {
												delete sessions[session()!];
												setSession(undefined);
												return sessions;
											});
										}}
									/>
								</div>
								<Show when={session()}>
									<div class="flex gap-2">
										<Average
											n={5}
											session={c_session()}
										/>
										<Average
											n={12}
											session={c_session()}
										/>
									</div>
									<div class="max-h-[calc(100vh-200px)]">
										<SolveTable />
									</div>
								</Show>
							</div>
						</SheetContent>
					</Sheet>
					<Button
						aria-label="Generate new scramble"
						size="sm"
						variant="secondary"
						onClick={newScramble}>
						<TbRefresh size={24} />
					</Button>
					<Separator orientation="vertical" />
					<Switch
						label="Show icons"
						checked={scrambleIcons()}
						onChange={setScrambleIcons}
					/>
				</div>
				<div
					class={cn(
						"flex gap-2 overflow-auto p-2 transition",
						running() && "blur grayscale",
						scrambleIcons() ? "[&>*]:w-14" : "justify-center"
					)}>
					<For each={scramble()}>
						{x => (
							<Show
								when={scrambleIcons()}
								fallback={
									<>
										{CMove[x]
											.replace("1", "")
											.replace("3", "'") + " "}
									</>
								}>
								<Move move={x} />
							</Show>
						)}
					</For>
				</div>
			</Card>

			<div
				class="flex flex-1 items-center justify-center outline-none"
				tabindex="0"
				onKeyDown={e => {
					if (e.key === " ") {
						timer_toggle();
					}
				}}
				onClick={() => timer_toggle()}>
				<Show
					when={session()}
					fallback={
						<span class="text-lg font-bold sm:text-xl">
							Please select or create a session.
						</span>
					}>
					<div class="flex flex-col items-center gap-2">
						<Show when={elapsed()}>
							<span class="font-mono text-5xl font-bold">
								{format_stopwatch(elapsed()!)}
							</span>
						</Show>
						<span class="text-muted">
							Presss space bar, tap or click to{" "}
							<Show
								when={!running()}
								fallback={<>stop</>}>
								start
							</Show>
							.
						</span>
						<Show when={session()}>
							<Average
								n={5}
								session={c_session()}
							/>
							<Average
								n={12}
								session={c_session()}
							/>
						</Show>
					</div>
				</Show>
			</div>
		</div>
	);

	function Average(props: { session: Session; n: number }) {
	    const average = createMemo<(number | false) | null>(() => props.session.solves.length >= props.n ? avg_of_n(props.session.solves, props.n) : null);
						
		return (
			<>
				<Show when={average() !== null}>
					<span class="text-muted">
						ao{props.n}{" "}
						{average() === false ? "DNF" : format_stopwatch(average()! as number)}
					</span>
				</Show>
			</>
		);
	}

	function SolveTable() {
		return (
			<Table>
				<TableCaption>
					A list of your solves for this session.
				</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead>Time</TableHead>
						<TableHead>Scramble</TableHead>
						<th />
					</TableRow>
				</TableHeader>
				<TableBody>
					<For each={sessions()[session()!].solves}>
						{(solve, i) => (
							<Solve
								solve={solve}
								i={i}
							/>
						)}
					</For>
				</TableBody>
			</Table>
		);
	}

	function Solve(props: { solve: Solve; i: () => number }) {
		return (
			<TableRow>
				<TableCell>
					<Show
						when={!props.solve.dnf}
						fallback={<>DNF</>}>
						<Show
							when={props.solve.plus_2}
							fallback={
								<>{format_stopwatch(props.solve.time)}</>
							}>
							{format_stopwatch(props.solve.time + 2000)}+
						</Show>
					</Show>
				</TableCell>
				<TableCell>
					{props.solve.scramble
						.map(x => CMove[x].replace("3", "'").replace("1", ""))
						.join(" ")}
				</TableCell>
				<TableCell class="flex flex-col gap-2 sm:flex-row">
					<SolveMenu
						solve={props.solve}
						delete={() => {
							setSessions(sessions => {
								const current = sessions[session()!];
								current.solves.splice(props.i(), 1);
								return sessions;
							});
						}}
						penalty={(dnf, plus_2) => {
							setSessions(sessions => {
								const current = sessions[session()!];
								current.solves.splice(props.i(), 1, {
									...props.solve,
									dnf,
									plus_2
								});
								return sessions;
							});
						}}
						use_scramble={() => setScramble(props.solve.scramble)}
					/>
				</TableCell>
			</TableRow>
		);
	}

	function SolveMenu(props: {
		solve: Solve;
		delete: () => void;
		penalty: (dnf: boolean, plus_2: boolean) => void;
		use_scramble: () => void;
	}) {
		const [penalty, setPenalty] = createSignal<string>(
			props.solve.dnf ? "dnf" : props.solve.plus_2 ? "+2" : "none"
		);

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<As
						component={Button}
						variant="ghost"
						class="h-8 w-8 p-0"
						aria-label="Solve actions">
						<TbDots size={16} />
					</As>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onSelect={props.use_scramble}>
						Use scramble
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={props.delete}>
						Delete
					</DropdownMenuItem>
					<DropdownMenuGroup>
						<DropdownMenuGroupLabel>Penalty</DropdownMenuGroupLabel>
						<DropdownMenuRadioGroup
							value={penalty()}
							onChange={penalty => {
								setPenalty(penalty);

								props.penalty(
									penalty === "dnf",
									penalty === "+2"
								);
							}}>
							<DropdownMenuRadioItem value="none">
								None
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="+2">
								+2
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="dnf">
								DNF
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}
}
