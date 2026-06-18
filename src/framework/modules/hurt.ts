import type { Client } from "framework";
import { PhysicsHandler } from "framework/physics/physics";
import { DecorateState, StateBase } from "./base_state";
import { CheckRail } from "./rail";

/**
 * @class
 * @augments StateBase
 */
@DecorateState()
export class StateHurt extends StateBase {
	protected CheckInput(Client: Client) {
		return CheckRail(Client);
	}

	protected BeforeUpdateHook(Client: Client) {
		PhysicsHandler.AlignToGravity(Client);
		PhysicsHandler.ApplyGravity(Client);
		Client.Ground.Grounded = false;
	}

	protected AfterUpdateHook(Client: Client) {
		if (Client.Ground.Grounded) {
			Client.State.Current = Client.State.States.Grounded;
			Client.Animation.Current = "Land";
			Client.Land();
			Client.Speed = Client.Speed.Lerp(Vector3.zero, math.abs(Client.Ground.DotProduct));
		} else if (Client.Flags.HurtTime > 0) {
			Client.Flags.HurtTime--;

			if (Client.Flags.HurtTime <= 0) {
				Client.State.Current = Client.State.States.Airborne;
				Client.Animation.Current = "Fall";
			}
		}
	}
}
