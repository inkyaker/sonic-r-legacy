import { FrameworkState } from "shared/common/frameworkstate";
import type { Client } from ".";
import type { BaseState } from "./modules/state";
import { StateList } from "./states";

/**
 * State machine
 * @class
 */
export class StateMachine {
	private Client: Client;
	public TickTimer: number;
	public States: StateList;
	public Current: BaseState;

	constructor(Client: Client) {
		this.States = new StateList();

		this.TickTimer = os.clock();
		this.Client = Client;
		this.Current = this.States.Airborne;
	}

	public GetStateName(State: BaseState) {
		for (const [Name, Target] of pairs(this.States)) {
			if (Target === State) {
				return Name;
			}
		}

		return "";
	}

	/**
	 * Internal method for ticking the current state
	 */
	private TickState() {
		this.Current.CheckMoves(this.Client);

		this.Current.Tick(this.Client);
	}

	/**
	 * Update the state machine, **only run this if you know what you're doing!**
	 */
	public Update(DeltaTime: number) {
		if (FrameworkState.GameSpeed === 0) {
			this.Client.Input.PrepareReset();
			this.Client.Input.Update();

			return;
		}

		// Internal fixed update loop
		this.TickTimer = math.min(this.TickTimer + DeltaTime * (60 * FrameworkState.GameSpeed), 10);
		while (this.TickTimer > 1) {
			// Timers
			if (this.Client.Flags.LockTimer > 0) {
				this.Client.Flags.LockTimer--;
			}

			if (this.Client.Flags.Invulnerability > 0) {
				this.Client.Flags.Invulnerability--;
			}

			// Main update
			this.Client.Input.Update();
			this.Client.Input.PrepareReset();

			// DEBUG
			if (this.Client.Input.Button.Debug.Pressed) {
				this.Client.Flags.Gravity = this.Client.Flags.Gravity.mul(-1);
				this.Client.Ground.Grounded = false;
				this.Client.SetAngle(this.Client.Angle.mul(CFrame.Angles(0, 0, 180)));
				this.Client.Speed = this.Client.Speed.mul(new Vector3(1, -1, 0));
			}

			// Objects
			this.Client.Object.TickObjects();
			this.TickState();

			// Character state
			for (const [_, State] of pairs(this.States)) {
				State.Step(this.Client);
			}

			this.TickTimer--;

			this.Client.LastCFrame = this.Client.CurrentCFrame;
			this.Client.CurrentCFrame = this.Client.Angle.add(this.Client.Position);
		}
	}
}
