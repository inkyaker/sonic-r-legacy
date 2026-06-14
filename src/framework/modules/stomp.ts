import type { Client } from "framework";
import { PhysicsHandler } from "framework/physics/physics";
import { CheckJump } from "./jump";
import { CheckRail } from "./rail";
import { BaseState } from "./state";

export function CheckStomp(Client: Client) {
	if (Client.Input.Button.Stomp.DidPress) {
		Client.Speed = Client.Speed.WithY(-6);
		Client.State.Current = Client.State.States.Stomp;

		Client.Animation.Current = "Stomp";

		return true;
	}
}

export class StateStomp extends BaseState {
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
				Client.Sound.Play("Character/Land");

				Client.Animation.Current = "StompLand";
				Client.Land();
			} else if (this.GroundedTicks >= 67) Client.State.Current = Client.State.States.Grounded;

			this.GroundedTicks++;
		} else Client.Speed = Client.Speed.mul(0.98).WithY(Client.Speed.Y);
	}

	protected OnStep(Client: Client) {
		if (this.GroundedTicks !== 0 && Client.State.Current !== Client.State.States.Stomp) this.GroundedTicks = 0;
	}
}
