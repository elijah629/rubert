import { Move as CMove } from "@/lib/cube";
import {
	For,
	Show,
	createEffect,
	createMemo,
	createSignal,
	on,
	onCleanup,
	onMount
} from "solid-js";
import * as idb from "idb";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Move from "@/components/Move";
import { Card } from "@/components/ui/card";
import { avg_of_n, cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/seperator";
import { scramblers } from "@/lib/scramblers";
import Sessions from "@/components/Sessions";
import ImportScramble from "@/components/ImportScramble";
import { IconDownload, IconRefresh } from "@/lib/icons";

export interface Solve {
	time: number;
	dnf: boolean;
	plus_2: boolean;
	scramble: CMove[];
}

export interface Session {
	solves: Solve[];
}

export function format_stopwatch(ms: number): string {
	const dt = new Date(ms);
	const ms_2 = ((dt.getMilliseconds() / 10) | 0).toString().padStart(2, "0");
	const seconds = dt.getSeconds().toString().padStart(2, "0");
	const minutes = dt.getMinutes();

	return `${minutes}:${seconds}.${ms_2}`;
}

export function Average(props: { session: Session; n: number }) {
	const average = createMemo<(number | false) | null>(() =>
		props.session.solves.length >= props.n
			? avg_of_n(props.session.solves, props.n)
			: null
	);

	return (
		<>
			<Show when={average() !== null}>
				<span class="text-muted">
					ao{props.n}{" "}
					{average() === false
						? "DNF"
						: format_stopwatch(average()! as number)}
				</span>
			</Show>
		</>
	);
}

enum TimerState {
	Idle,
	Running,
	JustStopped
}

export default function Timer() {
	const [sessions, setSessions] = createSignal<Map<string, Session>>(
		new Map(),
		{ equals: false }
	);
	const [session, setSession] = createSignal<string>();
	const [scramble, setScramble] = createSignal<CMove[]>();
	const [elapsed, setElapsed] = createSignal<number>();
	const [scrambler, setScrambler] = createSignal<string>(
		[...scramblers.keys()][0]
	);
	const [timerState, setTimerState] = createSignal<TimerState>(
		TimerState.Idle
	);
	const [scrambleIcons, setScrambleIcons] = createSignal<boolean>(true);

	let timer_element!: HTMLDivElement;

	let start_time: number | null = null;
	const newScramble = async () => {
		setScramble(await scramblers.get(scrambler())!());
	};

	const update_timer = () => {
		if (timerState() === TimerState.Running) {
			setElapsed(Date.now() - start_time!);
			window.requestAnimationFrame(update_timer);
		}
	};

	createEffect(() => {
		const window_keydown = (e: KeyboardEvent) => {
			if (
				e.key !== " " ||
				!session() ||
				!document.activeElement?.contains(timer_element) ||
				timerState() !== TimerState.Running
			) {
				return;
			}

			setTimerState(TimerState.JustStopped);
		};

		const window_keyup = (e: KeyboardEvent) => {
			if (
				e.key !== " " ||
				!session() ||
				!document.activeElement?.contains(timer_element)
			) {
				return;
			}

			setTimerState(
				{
					[TimerState.Idle]: TimerState.Running,
					[TimerState.Running]: TimerState.Running,
					[TimerState.JustStopped]: TimerState.Idle
				}[timerState()]
			);
		};

		window.addEventListener("keydown", window_keydown);
		window.addEventListener("keyup", window_keyup);
		onCleanup(() => {
			window.removeEventListener("keydown", window_keydown);
			window.removeEventListener("keyup", window_keyup);
		});
	});

	onMount(newScramble);

	createEffect(
		on(session, () => {
			setTimerState(TimerState.Idle);
			setElapsed(undefined);
		})
	);

	const on_timer_ended = () => {
		setSessions(sessions => {
			sessions.set(session()!, {
				solves: [
					...sessions.get(session()!)!.solves,
					{
						time: elapsed()!,
						scramble: scramble()!,
						dnf: false,
						plus_2: false
					}
				]
			});
			newScramble();
			return sessions;
		});
	};

	createEffect(
		on(
			timerState,
			() => {
				switch (timerState()) {
					case TimerState.Running:
						start_time = Date.now();
						update_timer(); // Start timer loop
						break;
					case TimerState.JustStopped:
						on_timer_ended();
						break;
				}
				// I have no idea why, but if I check !session(), it causes an infinite loop of adding sessions crashing the tab.
				// Loop starts from the TimerState.Idle case and it loops for some reason idk. Not running this when session changes
				// fixes it. but I have to tell it to not run on startup because session is obviously undefined.
			},
			{ defer: true }
		)
	);

	// onMount can't work because we would need to put a createEffect inside of an onMount and that disables destruction
	if (typeof window !== "undefined") {
		let can_update = false;

		const db = idb.openDB("timer-db", 1, {
			upgrade(db) {
				db.createObjectStore("sessions");
			}
		});

		createEffect(
			on(sessions, async () => {
				if (!can_update) {
					return;
				}
				const tx = (await db).transaction("sessions", "readwrite");
				const store = tx.objectStore("sessions");

				for (const key of await store.getAllKeys()) {
					store.delete(key);
				}

				sessions().forEach((session, name) => {
					store.add(session, name);
				});

				tx.commit();
			})
		);
		onMount(async () => {
			const tx = (await db).transaction("sessions", "readonly");
			const store = tx.objectStore("sessions");

			const k: string[] = (await store.getAllKeys()) as string[];
			const v: Session[] = await store.getAll();

			setSessions(sessions => {
				for (let i = 0; i < k.length; i++) {
					sessions.set(k[i], v[i]);
				}
				return sessions;
			});
			can_update = true;
		});
	}

	return (
		<div class="mt-2 flex flex-1 flex-col gap-2">
			<Card class="flex flex-col gap-2 p-4">
				<div class="flex items-center gap-2 overflow-auto">
					<Sessions
						session={session()}
						sessions={sessions()}
						setSession={setSession}
						setSessions={setSessions}
						setScramble={setScramble}
					/>
					<Separator orientation="vertical" />
					<Button
						aria-label="Generate new scramble"
						size="sm"
						variant="secondary"
						onClick={newScramble}>
						<IconRefresh size={24} />
					</Button>
					<Select
						value={scrambler()}
						onChange={async x => {
							if (x) {
								setScrambler(x);
								await newScramble();
							}
						}}
						options={[...scramblers.keys()]}
						// placeholder="Select a scrambler…"
						itemComponent={props => (
							<SelectItem item={props.item}>
								{props.item.rawValue}
							</SelectItem>
						)}>
						<SelectTrigger
							aria-label="Scrambler"
							class="w-24 sm:w-44">
							<SelectValue<string>>
								{state => state.selectedOption()}
							</SelectValue>
						</SelectTrigger>
						<SelectContent />
					</Select>
					<ImportScramble onImport={setScramble} />
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
						timerState() === TimerState.Running && "blur grayscale",
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
				onClick={() => {
					if (!session()) {
						return;
					}

					if (timerState() === TimerState.Running) {
						setTimerState(TimerState.Idle);
						on_timer_ended();
					} else if (timerState() === TimerState.Idle) {
						setTimerState(TimerState.Running);
					}
				}}>
				<Show
					when={session()}
					fallback={
						<span class="text-lg font-bold sm:text-xl">
							Please select or create a session.
						</span>
					}>
					<div
						class="flex flex-col items-center gap-2"
						ref={timer_element}>
						<Show when={elapsed()}>
							<span class="font-mono text-5xl font-bold">
								{format_stopwatch(elapsed()!)}
							</span>
						</Show>
						<span class="text-muted">
							Press space bar, tap or click to{" "}
							<Show
								when={timerState() === TimerState.Running}
								fallback={<>start</>}>
								stop
							</Show>
							.
						</span>
						<Show when={session()}>
							<For each={[5, 12, 100]}>
								{n => (
									<Average
										n={n}
										session={(() =>
											sessions().get(session()!)!)()}
									/>
								)}
							</For>
						</Show>
					</div>
				</Show>
			</div>
		</div>
	);
}
