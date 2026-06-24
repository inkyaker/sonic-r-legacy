type Log = Array<string>;

const Verbose = false;
export const LogTable: Map<number, Log> = new Map();

export function AddLog(Value: unknown, Context?: { Error?: boolean }) {
	let Export = tostring(Value);

	if (typeOf(Export) !== "string") return;

	const Tick = os.clock();
	const Original: Log | undefined = LogTable.get(Tick);

	if (Verbose) print(Value);

	if (Original !== undefined) {
		Original.push(Export);

		LogTable.set(Tick, Original);
	} else {
		let NewValue: Array<string> = new Array();
		NewValue.push(Export);

		LogTable.set(Tick, NewValue);
	}

	if (Context?.Error) error(Context.Error);
}

export function WipeLog() {
	LogTable.clear();
}

export function ExportLog() {
	for (const [Tick, Logs] of LogTable) Logs.forEach((Log) => print(`${Tick}: ${Log}`));
}
