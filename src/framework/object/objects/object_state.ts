import Signal from "@rbxts/lemon-signal";

/**
 * state machine with callbacks for stateful objects
 */
export class ObjectState<const States extends readonly string[]> {
	private Signals = new Map<States[number], Signal<string>>();
	private State!: States[number];

	constructor(public readonly States: States) {
		this.States.forEach((State) => this.Signals.set(State as States[number], new Signal<States[number]>()));
	}

	public On(State: States[number]) {
		return this.Signals.get(State)!;
	}

	public Set(State: States[number]) {
		if (this.Is(State)) return;
		const LastState = this.State;
		this.State = State;
		this.On(State).Fire(LastState);
	}

	public Get(): States[number] {
		return this.State;
	}

	public Is(State: States[number]) {
		return this.Get() === State;
	}

	public Destroy() {
		this.Signals.forEach((Signal) => Signal.Destroy());
	}

	public Serialize() {
		return {
			CurrentState: this.State,
		};
	}

	public Deserialize(Data: unknown) {
		this.Set((Data as { CurrentState: States[number] }).CurrentState);
	}
}
