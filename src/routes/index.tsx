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
	TbFreezeColumn,
	TbRefresh,
	TbX
} from "solid-icons/tb";
import init, { generate_scramble } from "@/solver/solver";
import Move from "@/components/Move";
import { As } from "@kobalte/core";
import { Card } from "@/components/ui/card";
import NewSessionButton from "@/components/NewSessionButton";
import DeleteSessionButton from "@/components/DeleteSessionButton";

interface Solve {
	time: number;
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
	const [sessions, setSessions] = createSignal<Record<string, Session>>({});
	const [session, setSession] = createSignal<string>();
	const [scramble, setScramble] = createSignal<CMove[]>();
	const [elapsed, setElapsed] = createSignal<number>();
	const [started, setStarted] = createSignal<boolean>(false);

	let start_time = null;
	const newScramble = async () => {
		await init();

		setScramble(Array.from(generate_scramble(20)));
	};

	const update_timer = () => {
		const elapsed = Date.now() - start_time!;
		setElapsed(elapsed);

		if (started()) {
			window.requestAnimationFrame(update_timer);
		}
	};

	onMount(newScramble);

	const timer_toggle = () => {
	    if (!session()) {
			return;
		}
		setStarted(!started());
		if (started()) {
			window.requestAnimationFrame(update_timer);
			start_time = Date.now();
		} else {
			setSessions(sessions => {
				const ses = { ...sessions };
				const current = ses[session()!];
				current.solves.push({
					time: elapsed()!,
					scramble: scramble()!
				});
				return ses;
			});
		}
	};

	onMount(() => {
		window.addEventListener("keydown", e => {
			if (e.key === " ") {
				timer_toggle();
			}
		});
	});

	if (typeof window !== "undefined") {
		let can_update = false;

		const db = idb.openDB("timer-db", 1, {
			upgrade(db) {
				db.createObjectStore(
					"sessions" /*, { keyPath: "name", autoIncrement: true }*/
				);
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
									<div class="flex gap-2">
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
												setSessions(sessions => ({
													...sessions,
													[x]: { solves: [] }
												}));
												setSession(x);
											}}
										/>
										<DeleteSessionButton has_session={!!session()} onDelete={() => { setSessions(sessions => { const s = {...sessions}; delete s[session()!]; setSession(undefined); return s; }) }}/>
									</div>
									<Show when={session()}>
										<div class="m-2 flex max-h-[calc(100vh-200px)] flex-col overflow-auto">
											<For
												each={
													sessions()[session()!]
														.solves
												}>
												{(solve, i) => (
													<span class="flex gap-1 rounded-sm p-2 hover:bg-muted hover:text-muted-foreground">
														<Button
															onClick={() => {
																setSessions(
																	sessions => {
																		const ses =
																			{
																				...sessions
																			};
																		const current =
																			ses[
																				session()!
																			];
																		current.solves.splice(
																			i(),
																			1
																		);
																		return ses;
																	}
																);
															}}
															variant="destructive"
															size="sm"
															class="h-5 w-5 px-0">
															<TbX size={16} />
														</Button>
														#{i() + 1}
														<strong>
															{format_stopwatch(
																solve.time
															)}
														</strong>
														{solve.scramble
															.map(x => CMove[x])
															.join(" ")}
													</span>
												)}
											</For>
										</div>
									</Show>
								</SheetDescription>
							</SheetHeader>
						</SheetContent>
					</Sheet>
					<Button
						size="sm"
						variant="secondary"
						onClick={newScramble}>
						<TbRefresh size={24} />
					</Button>
				</div>
				<div class="flex gap-2 overflow-auto p-2 [&>*]:w-14">
					<For each={scramble()}>{x => <Move move={x} />}</For>
				</div>
			</Card>

			<div class="flex flex-1 items-center justify-center">
				<Show
					when={session()}
					fallback={
						<span class="text-lg font-bold sm:text-xl">
							Please select or create a session.
						</span>
					}>
					<div
						class="flex flex-col items-center gap-2"
						onClick={() => {
							timer_toggle();
						}}>
						<Show when={elapsed()}>
							<span class="font-mono text-5xl font-bold">
								{format_stopwatch(elapsed()!)}
							</span>
						</Show>
						<span class="text-muted">
							Presss space bar, tap or click to{" "}
							<Show
								when={!started()}
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
