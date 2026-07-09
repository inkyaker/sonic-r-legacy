import type { Client } from "framework";
import { CanGetup } from "framework/physics/collision";
import { IntertiaState, PhysicsHandler } from "framework/physics/physics";
import { DecorateState, StateBase } from "./base_state";
import { StepBoost } from "./boost";
import { CheckJump } from "./jump";
import { CheckRail } from "./rail";

export function CheckSlide(Client: Client) {
	if (Client.Input.Button.Slide.IsDown) {
		Client.Speed = Client.Speed.WithX(math.max(Client.Speed.X, 4));
		Client.State.Current = Client.State.States.Slide;

		return true;
	}
}

/**
 * @class
 * @augments StateBase
 */
@DecorateState()
export class StateSlide extends StateBase {
	public SlideTicks = 0;
	public FromStomp = false;

	protected CheckInput(Client: Client) {
		return CheckJump(Client) || CheckRail(Client);
	}

	protected BeforeUpdateHook(Client: Client) {
		PhysicsHandler.ApplyGravity(Client);

		PhysicsHandler.Turn(Client, math.clamp(Client.Input.GetTurn(), -Client.Config.SlideTurnRate, Client.Config.SlideTurnRate), IntertiaState.GROUND_NOFRICT);
	}

	protected AfterUpdateHook(Client: Client) {
		if (this.FromStomp && this.SlideTicks <= 10 && !Client.Input.Button.Slide.IsDown) {
			const Stomp = Client.State.States.Stomp;
			Stomp.HasGrounded = true;
			Stomp.GroundedTicks = 10;
			Client.State.Current = Stomp;
			Client.Animation.Current = "StompLand";

			return;
		}

		Client.Animation.Current = "Slide";
		Client.Speed = Client.Speed.mul(new Vector3(0.985, 1, 0.25));
		if (Client.Speed.X < 2) Client.Speed = Client.Speed.WithX(2);

		if (Client.Ground.Grounded) {
			Client.Ground.UngroundedFrames = 0;
			if (this.SlideTicks >= 75 && CanGetup(Client)) Client.State.Current = Client.State.States.Grounded;
		} else if (Client.Ground.UngroundedFrames >= Client.Config.CoyoteFrames) {
			Client.Animation.Current = "Fall";
			Client.State.Current = Client.State.States.Airborne;
		} else Client.Ground.UngroundedFrames++;

		if (Client.Input.Button.Boost.DidPress && CanGetup(Client)) {
			Client.State.Current = Client.Ground.Grounded ? Client.State.States.Grounded : Client.State.States.Airborne;
			StepBoost(Client);
		}

		this.SlideTicks++;
	}

	protected OnStep(Client: Client) {
		if (this.SlideTicks > 0 && Client.State.Current.GetID() !== "StateSlide") {
			this.SlideTicks = 0;
			this.FromStomp = false;
		}
	}
}
