import type { Client } from "framework";
import { PhysicsHandler } from "framework/physics/physics";
import { DecorateState, StateBase } from "./base_state";
import { CancelBoost } from "./boost";
import { CheckJump } from "./jump";
import { CheckRail } from "./rail";
import { CheckSlide } from "./slide";

export function CheckStomp(Client: Client) {
	if (Client.Input.Button.Stomp.DidPress) {
		CancelBoost(Client);
		Client.ExitBall();
		Client.Speed = Client.Speed.WithY(-6);
		Client.State.Current = Client.State.States.Stomp;

		Client.Animation.Current = "Stomp";
		Client.Sound.Play("Character/StompStart");

		return true;
	}
}

@DecorateState()
export class StateStomp extends StateBase {
	public GroundedTicks = 0;

	protected CheckInput(Client: Client) {
		return (Client.Ground.Grounded && CheckJump(Client)) || CheckRail(Client);
	}

	protected BeforeUpdateHook(Client: Client) {
		if (Client.Animation.Current === "Spring" && Client.Speed.Y <= 0.5) {
			Client.Animation.Current = "Fall";
		}

		if (!Client.IsScripted()) {
			PhysicsHandler.ApplyGravity(Client);
			PhysicsHandler.AlignToGravity(Client);
		}

		PhysicsHandler.AccelerateAirborne(Client);

		if (Client.Ground.Grounded && Client.Input.Button.Boost.DidPress) Client.State.Current = Client.State.States.Grounded;
	}

	protected AfterUpdateHook(Client: Client) {
		if (Client.Animation.Current === "Roll") Client.Animation.Speed = Client.Speed.Magnitude;

		if (Client.Ground.Grounded) {
			Client.Speed = Client.Speed.mul(0.225);

			if (this.GroundedTicks === 0) {
				Client.Sound.Stop("Character/StompStart");
				Client.Sound.Play("Character/StompLand");

				Client.Animation.Current = "StompLand";
				Client.Land();
			} else if (this.GroundedTicks >= 67) Client.State.Current = Client.State.States.Grounded;

			CheckSlide(Client);
			this.GroundedTicks++;
		} else {
			if (Client.Input.Button.Boost.DidPress) Client.State.Current = Client.State.States.Airborne;
			Client.Speed = Client.Speed.mul(0.98).WithY(Client.Speed.Y);
		}
	}

	protected OnStep(Client: Client) {
		if (this.GroundedTicks !== 0 && Client.State.Current !== Client.State.States.Stomp) this.GroundedTicks = 0;
	}
}
