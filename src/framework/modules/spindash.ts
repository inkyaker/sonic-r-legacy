import type { Client } from "framework";
import { PhysicsHandler } from "framework/physics/physics";
import { CheckJump } from "./jump";
import { CheckRail } from "./rail";
import { BaseState } from "./state";

/**
 * Function ran in `State.CheckInput`
 * @move
 * @param Client
 * @returns Move successful
 */
export function CheckSpindash(Client: Client) {
	if (Client.Input.Button.Spindash.Pressed) {
		Client.State.Current = Client.State.States.Spindash;
		Client.Flags.SpindashSpeed = math.max(Client.Speed.X, 2);
		Client.EnterBall();

		Client.Sound.Play("Character/SpindashCharge");

		return true;
	}
}

/**
 * @class
 * @state
 * @augments BaseState
 */
export class StateSpindash extends BaseState {
	protected CheckInput(Client: Client) {
		if (Client.Input.Button.Spindash.Activated) {
			if (Client.Flags.SpindashSpeed < 10) {
				Client.Flags.SpindashSpeed += 0.4;
			}
		} else {
			// Release
			Client.Sound.Stop("Character/SpindashCharge");
			Client.Sound.Play("Character/SpindashRelease");

			Client.Speed = Client.Speed.mul(new Vector3(0, 1, 1)).add(new Vector3(Client.Flags.SpindashSpeed, 0, 0));
			Client.EnterBall();
			Client.State.Current = Client.State.States.Roll;
		}

		return CheckRail(Client);
	}

	protected AfterUpdateHook(Client: Client) {
		PhysicsHandler.ApplyGravity(Client);
		PhysicsHandler.Turn(Client, Client.Input.GetTurn(), undefined);
		PhysicsHandler.Skid(Client);
		//PhysicsHandler.AccelerateGrounded(Client)

		if (Client.Ground.Grounded) {
			Client.Animation.Current = "Spindash";
		} else {
			Client.Animation.Current = "Roll";
			Client.State.Current = Client.State.States.Airborne;
		}
	}
}

/**
 * @class
 * @state
 * @augments BaseState
 */
export class StateRoll extends BaseState {
	protected CheckInput(Client: Client) {
		if (Client.Input.Button.Roll.Pressed || Client.Speed.X < Client.Config.RollGetup) {
			// TODO: ceil clip
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
