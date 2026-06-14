import type { Client } from "framework";
import { PhysicsHandler } from "framework/physics/physics";
import { CheckJump } from "./jump";
import { CheckRail } from "./rail";
import { BaseState } from "./state";

/**
 * @class
 * @state
 * @augments BaseState
 */
export class StateRoll extends BaseState {
	protected CheckInput(Client: Client) {
		if (Client.Input.Button.Roll.DidPress || Client.Speed.X < Client.Config.RollGetup) {
			Client.State.Current = Client.State.States.Grounded;
			Client.ExitBall();

			return true;
		}

		return CheckJump(Client) || CheckRail(Client);
	}

	protected AfterUpdateHook(Client: Client) {
		PhysicsHandler.ApplyInertia(Client);
		PhysicsHandler.Turn(Client, Client.Input.GetTurn(), undefined);

		if (Client.Ground.Grounded) {
			Client.Animation.Current = "Roll";
			Client.Animation.Speed = Client.Speed.X;
		} else {
			Client.State.Current = Client.State.States.Airborne;
		}
	}
}
