import { Move as CMove } from "@/lib/cube";
import { For, Show, createEffect, createSignal, on, onMount } from "solid-js";
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
import {
	TbExposurePlus2,
	TbFreezeColumn,
	TbRefresh,
	TbX
} from "solid-icons/tb";
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

interface Solve {
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
				const current = sessions[session()!];
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
				<div class="flex gap-2">
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
							<div class="mt-2 flex flex-wrap gap-2">
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
											{state => state.selectedOption()}
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
								<div class="mt-2 max-h-[calc(100vh-200px)]">
									<Table>
										<TableCaption>
											A list of your solves for this
											session.
										</TableCaption>
										<TableHeader>
											<TableRow>
												<TableHead>Time</TableHead>
												<TableHead>Scramble</TableHead>
												<TableHead class="text-right">
													Actions
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											<For
												each={
													sessions()[session()!]
														.solves
												}>
												{(solve, i) => (
													<TableRow>
														<TableCell class="font-medium">
															#{i() + 1}
														</TableCell>
														<TableCell>
															<Show
																when={
																	!solve.dnf
																}
																fallback={
																	<>DNF</>
																}>
																<Show
																	when={
																		solve.plus_2
																	}
																	fallback={
																		<>
																			{format_stopwatch(
																				solve.time
																			)}
																		</>
																	}>
																	{format_stopwatch(
																		solve.time +
																			2000
																	)}
																	+
																</Show>
															</Show>
														</TableCell>
														<TableCell>
															{solve.scramble
																.map(
																	x =>
																		CMove[x]
																)
																.join(" ")}
														</TableCell>
														<TableCell class="flex flex-col gap-2 sm:flex-row">
															<Button
																aria-label="Delete solve"
																onClick={() => {
																	setSessions(
																		sessions => {
																			const current =
																				sessions[
																					session()!
																				];
																			current.solves.splice(
																				i(),
																				1
																			);
																			return sessions;
																		}
																	);
																}}
																variant="destructive"
																size="sm">
																<TbX
																	size={16}
																/>
															</Button>
															<Button
																aria-label="Plus 2 Solve"
																onClick={() => {
																	setSessions(
																		sessions => {
																			const current =
																				sessions[
																					session()!
																				]
																					.solves[
																					i()
																				];

																			current.plus_2 =
																				!current.plus_2;
																			return structuredClone(
																				sessions
																			);
																		}
																	);
																}}
																size="sm">
																<TbExposurePlus2
																	size={16}
																/>
															</Button>
															<Button
																onClick={() => {
																	setSessions(
																		sessions => {
																			const current =
																				sessions[
																					session()!
																				]
																					.solves[
																					i()
																				];

																			current.dnf =
																				!current.dnf;
																			return structuredClone(
																				sessions
																			);
																		}
																	);
																}}
																size="sm">
																DNF
															</Button>
														</TableCell>
													</TableRow>
												)}
											</For>
										</TableBody>
									</Table>
								</div>
							</Show>
						</SheetContent>
					</Sheet>
					<Button
						aria-label="Generate new scramble"
						size="sm"
						variant="secondary"
						onClick={newScramble}>
						<TbRefresh size={24} />
					</Button>
				</div>
				<div
					class={`flex gap-2 overflow-auto p-2 [&>*]:w-14 transition${
						running() ? " blur grayscale" : ""
					}`}>
					<For each={scramble()}>{x => <Move move={x} />}</For>
				</div>
			</Card>

			<div
				class="flex flex-1 items-center justify-center"
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
						<Show
							when={
								session() &&
								sessions()[session()!].solves.length != 0
							}>
							<span class="text-muted">
								{format_stopwatch(
									sessions()
										[session()!].solves.map(x => x.time)
										.reduce((a, b) => a + b) /
										sessions()[session()!].solves.length
								)}{" "}
								average
							</span>
						</Show>
					</div>
				</Show>
			</div>
		</div>
	);
}
