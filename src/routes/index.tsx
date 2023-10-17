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
import { TbRefresh } from "solid-icons/tb";
import Move from "@/components/Move";
import { Card } from "@/components/ui/card";
import { avg_of_n, cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/seperator";
import { scramblers } from "@/lib/scramblers";
import Sessions from "@/components/Sessions";
import ImportScramble from "@/components/ImportScramble";

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
	const [sessions, setSessions] = createSignal<Record<string, Session>>(
		{},
		{ equals: false }
	);
	const [session, setSession] = createSignal<string>();
	const [scramble, setScramble] = createSignal<CMove[]>();
	const [elapsed, setElapsed] = createSignal<number>();
	const [scrambler, setScrambler] = createSignal<string>(
		Object.keys(scramblers)[0]
	);
	const [timerState, setTimerState] = createSignal<TimerState>(
		TimerState.Idle
	);
	const [scrambleIcons, setScrambleIcons] = createSignal<boolean>(true);

	const c_session = () => sessions()[session()!];

	let start_time = null;
	const newScramble = async () => {
		setScramble(await scramblers[scrambler()]());
	};

	const update_timer = () => {
		const elapsed = Date.now() - start_time!;
		setElapsed(elapsed);

		if (timerState() === TimerState.Running) {
			window.requestAnimationFrame(update_timer);
		}
	};

	createEffect(() => {
		const window_keydown = (e: KeyboardEvent) => {
			if (
				e.key !== " " ||
				!session() ||
				document.activeElement !== document.body
			) {
				return;
			}

			if (timerState() === TimerState.Running) {
				setTimerState(TimerState.JustStopped);
			}
		};

		const window_keyup = (e: KeyboardEvent) => {
			if (
				e.key !== " " ||
				!session() ||
				document.activeElement !== document.body
			) {
				return;
			}

			setTimerState(
				{
					[TimerState.Idle]: TimerState.Running,
					[TimerState.JustStopped]: TimerState.Idle,
					[TimerState.Running]: TimerState.Running
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

	createEffect(
		on(
			timerState,
			() => {
				switch (timerState()) {
					case TimerState.Running:
						window.requestAnimationFrame(update_timer);
						start_time = Date.now();
						break;
					case TimerState.JustStopped:
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
				<div class="flex items-center flex-wrap gap-2">
					<Sessions
						session={session()}
						sessions={sessions()}
						setSessions={setSessions}
						setSession={setSession}
						setScramble={setScramble}
					/>
					<Separator orientation="vertical" />
					<Button
						aria-label="Generate new scramble"
						size="sm"
						variant="secondary"
						onClick={newScramble}>
						<TbRefresh size={24} />
					</Button>
					<Select
						value={scrambler()}
						onChange={async x => {
							if (x) {
								setScrambler(x);
								await newScramble();
							}
						}}
						options={Object.keys(scramblers)}
						// placeholder="Select a scrambler…"
						itemComponent={props => (
							<SelectItem item={props.item}>
								{props.item.rawValue}
							</SelectItem>
						)}>
						<SelectTrigger
							aria-label="Scrambler"
							class="w-[90px] sm:w-[180px]">
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
					setTimerState(
						{
							[TimerState.Running]: TimerState.Idle,
							[TimerState.Idle]: TimerState.Running,
							[TimerState.JustStopped]: TimerState.JustStopped
						}[timerState()]
					);
				}}>
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
										session={c_session()}
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
