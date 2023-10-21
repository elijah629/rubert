import { For, Setter, Show, createSignal } from "solid-js";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from "@/components/ui/sheet";
import { As } from "@kobalte/core";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import NewSessionButton from "./NewSessionButton";
import DeleteSessionButton from "./DeleteSessionButton";
import {
	Average,
	Session,
	Solve as ISolve,
	format_stopwatch
} from "@/routes/index";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import { Move } from "@/lib/cube";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuGroupLabel,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import AddSolve from "./AddSolve";
import { IconFreezeColumn, IconDots } from "@/lib/icons";

export default function Sessions(props: {
	session: string | undefined;
	setScramble: Setter<Move[] | undefined>;
	setSession: Setter<string | undefined>;
	setSessions: Setter<Map<string, Session>>;
	sessions: Map<string, Session>;
}) {
	const c_session = () => props.sessions.get(props.session!)!;

	return (
		<>
			<Sheet>
				<SheetTrigger asChild>
					<As
						component={Button}
						size="sm"
						class="gap-2">
						<span class="hidden sm:inline">Sessions</span>
						<IconFreezeColumn size={24} />
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
								value={props.session}
								onChange={props.setSession}
								options={[...props.sessions.keys()]}
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
									props.setSessions(sessions => {
										sessions.set(x, { solves: [] });
										props.setSession(x);
										return sessions;
									});
								}}
							/>
							<DeleteSessionButton
								has_session={!!props.session}
								onDelete={() => {
									props.setSessions(sessions => {
										sessions.delete(props.session!);
										props.setSession(undefined);
										return sessions;
									});
								}}
							/>
						</div>
						<Show when={props.session}>
							<div class="flex gap-2">
								<For each={[5, 12, 100]}>
									{n => (
										<Average
											n={n}
											session={c_session()}
										/>
									)}
								</For>
							</div>
							<div class="max-h-[calc(100vh-200px)]">
								<SolveTable
									setScramble={props.setScramble}
									setSessions={props.setSessions}
									sessions={props.sessions}
									session={props.session!}
								/>
							</div>
						</Show>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}

function SolveTable(props: {
	session: string;
	sessions: Map<string, Session>;
	setScramble: Setter<Move[] | undefined>;
	setSessions: Setter<Map<string, Session>>;
}) {
	return (
		<Table>
			<TableCaption>A list of your solves for this session.</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Time</TableHead>
					<TableHead>Scramble</TableHead>
					<TableHead>
						<AddSolve
							onAdd={s => {
								props.setSessions(sessions => {
									sessions.set(props.session, {
										solves: [
											...sessions.get(props.session)!
												.solves,
											s
										]
									});
									return sessions;
								});
							}}
						/>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<For each={props.sessions.get(props.session)!.solves}>
					{(solve, i) => (
						<Solve
							setSessions={props.setSessions}
							setScramble={props.setScramble}
							session={props.session}
							solve={solve}
							i={i}
						/>
					)}
				</For>
			</TableBody>
		</Table>
	);
}

function Solve(props: {
	solve: ISolve;
	i: () => number;
	setScramble: Setter<Move[] | undefined>;
	session: string;
	setSessions: Setter<Map<string, Session>>;
}) {
	return (
		<TableRow>
			<TableCell>
				<Show
					when={!props.solve.dnf}
					fallback={<>DNF</>}>
					<Show
						when={props.solve.plus_2}
						fallback={<>{format_stopwatch(props.solve.time)}</>}>
						{format_stopwatch(props.solve.time + 2000)}+
					</Show>
				</Show>
			</TableCell>
			<TableCell>
				{props.solve.scramble
					.map(x => Move[x].replace("3", "'").replace("1", ""))
					.join(" ")}
			</TableCell>
			<TableCell class="flex flex-col gap-2 sm:flex-row">
				<SolveMenu
					solve={props.solve}
					delete={() => {
						props.setSessions(sessions => {
							const new_session = sessions.get(props.session)!;
							new_session.solves.splice(props.i(), 1);
							sessions.set(props.session, new_session);
							return sessions;
						});
					}}
					penalty={(dnf, plus_2) => {
						props.setSessions(sessions => {
							const new_session = sessions.get(props.session)!;
							new_session.solves.splice(props.i(), 1, {
								...props.solve,
								dnf,
								plus_2
							});
							sessions.set(props.session, new_session);
							return sessions;
						});
					}}
					use_scramble={() => props.setScramble(props.solve.scramble)}
				/>
			</TableCell>
		</TableRow>
	);
}

function SolveMenu(props: {
	solve: ISolve;
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
					<IconDots size={16} />
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

							props.penalty(penalty === "dnf", penalty === "+2");
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
