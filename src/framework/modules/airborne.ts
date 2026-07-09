import type { Client } from "framework";
import { PhysicsHandler } from "framework/physics/physics";
import { DecorateState, StateBase } from "./base_state";
import { StepBoost } from "./boost";
import { CheckBounce } from "./bounce";
import { CheckHomingAttack, UpdateHomingObject } from "./homing";
import { CheckRail } from "./rail";
import { CheckStomp } from "./stomp";

/**
 * @class
 * @augments StateBase
 */
@DecorateState()
export class StateAirborne extends StateBase {
	protected CheckInput(Client: Client) {
		UpdateHomingObject(Client)
		return (!Client.Flags.Boosting && CheckHomingAttack(Client)) || CheckBounce(Client) || CheckStomp(Client) || CheckRail(Client);
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
	}

	protected AfterUpdateHook(Client: Client) {
		if (Client.Animation.Current === "Roll") Client.Animation.Speed = Client.Speed.Magnitude;

		if (Client.Ground.Grounded) {
			if (Client.Flags.InBounce) {
				Client.Flags.JumpTimer = 0;
				const Speed = 1 + math.abs(Client.Speed.X) / 16;
				Client.Speed = Client.Speed.mul(new Vector3(1, 0, 1)).add(new Vector3(0, Speed * ((Client.Flags.Bounces === 0 && 2.825) || 3.575)));

				Client.Flags.Bounces++;

				Client.Flags.InBounce = false;
				Client.Sound.Play("Character/Bounce")
				Client.Sound.Play("Character/BounceHard")
			} else {
				Client.Sound.Play("Character/Land");
				
				// TODO: Client.Animation.Current = Client.Speed.X > 0.5 ? "LandMoving" : Client.Speed.Y <= -6 ? "Land" : "LandShort";
				// reason its not here is becuase i need to work out the animation transition timing (manual endanimation event?)
				Client.Animation.Current = Client.Speed.Y <= -6 ? "Land" : "LandShort";

				Client.State.Current = Client.State.States.Grounded;
				Client.Land();
			}
		} else StepBoost(Client);
	}

	protected OnStep(Client: Client) {
		if (Client.Flags.InBounce && Client.State.Current.GetID() !== "StateAirborne") {
			Client.Flags.InBounce = false;
			Client.Flags.Bounces = 0;
		}
	}
}
