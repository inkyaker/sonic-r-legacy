import { FrameworkState } from "shared/common/frameworkstate";
import type { Client } from ".";
import type { StateBase } from "./modules/base_state";
import { CancelBoost } from "./modules/boost";
import { StateList } from "./states";

/**
 * State machine
 * @class
 */
export class StateMachine {
	private Client: Client;
	public TickTimer: number;
	public States: StateList;
	public Current: StateBase;
	public LastState: StateBase;

	constructor(Client: Client) {
		this.States = new StateList();

		this.TickTimer = os.clock();
		this.Client = Client;
		this.Current = this.States.Airborne;
		this.LastState = this.States.Grounded;
	}

	public GetStateName(State: StateBase) {
		for (const [Name, Target] of pairs(this.States)) if (Target === State) return Name;

		error(`dude what this state doesnt have a statename ${State}???????????`);
	}

	/**
	 * Internal method for ticking the current state
	 */
	private TickCurrentState() {
		this.Client.HomingAttack.Ticked = false;
		this.Client.Flags._BoostTicked = false; // TODO: move to some sort of client.pretick method if i end up needing more of these, thigns.

		this.Current.CheckMoves(this.Client);
		this.Current.Tick(this.Client);

		if (this.LastState !== this.Current) {
			this.LastState = this.Current;
		}

		if (!this.Client.Flags._BoostTicked && this.Client.Flags.Boosting) CancelBoost(this.Client);
	}

	/**
	 * Update the state machine, **only run this if you know what you're doing!**
	 */
	public Update(DeltaTime: number) {
		if (this.Client.Dead) return;

		if (FrameworkState.GameSpeed <= 0) {
			this.Client.Input.PrepareReset();
			this.Client.Input.Update();
			this.Client.Animation.Animate(this.Client);

			return;
		}

		// Internal fixed update loop
		this.TickTimer = math.min(this.TickTimer + DeltaTime * (60 * FrameworkState.GameSpeed), 10);
		while (this.TickTimer > 1) {
			// Timers
			if (this.Client.Flags.LockTimer > 0) this.Client.Flags.LockTimer--;
			if (this.Client.Flags.Invulnerability > 0) this.Client.Flags.Invulnerability--;

			// Main update
			this.Client.Input.Update();
			this.Client.Input.PrepareReset();

			// DEBUG
			if (this.Client.Input.Button.Debug.DidPress) {
				this.Client.Flags.Gravity = this.Client.Flags.Gravity.mul(-1);
				this.Client.Ground.Grounded = false;
				this.Client.SetAngle(this.Client.Angle.mul(CFrame.Angles(0, 0, math.pi)));
				this.Client.Speed = this.Client.Speed.mul(new Vector3(1, -1, 0));
			}

			// Tick character
			this.Client.Controller.Object.TickObjects();
			this.TickCurrentState();

			if (this.Client.Position.Y <= 0 || this.Client.Humanoid.Health <= 0) this.Client.Respawn();

			// Step states
			for (const [_, State] of pairs(this.States)) State.Step(this.Client);

			this.TickTimer--;

			this.Client.LastCFrame = this.Client.CurrentCFrame;
			this.Client.CurrentCFrame = this.Client.Angle.add(this.Client.Position).add(this.Client.Rail.RailOffset);
		}
	}
}
