import type { Client } from "framework";
import { PhysicsHandler } from "framework/physics/physics";
import { CheckJump } from "./jump";
import { CheckRail } from "./rail";
import { CheckSkid } from "./skid";
import { CheckSpindash } from "./spindash";
import { BaseState } from "./state";

/**
 * @class
 * @augments BaseState
 */
export class StateGrounded extends BaseState {
	private LockedAnimations = new Set(["LandMoving", "Land", "JogStart"]);

	protected CheckInput(Client: Client) {
		return CheckJump(Client) || CheckSpindash(Client) || CheckSkid(Client) || CheckRail(Client);
	}

	protected BeforeUpdateHook(Client: Client) {
		if (Client.Speed.X === 0) {
			PhysicsHandler.RotateWithGravity(Client);
		}

		PhysicsHandler.ApplyGravity(Client);
		PhysicsHandler.AccelerateGrounded(Client);
	}

	protected AfterUpdateHook(Client: Client) {
		if (Client.Ground.Grounded) {
			const Slip = math.sqrt(1);
			const Acceleration = math.min(math.abs(Client.Speed.X) / Client.Config.CrashSpeed, 1);

			if (!this.LockedAnimations.has(Client.Animation.Current)) Client.Animation.Current = math.abs(Client.Speed.X) > 0.1 ? "Run" : "Idle";

			Client.Animation.Speed = Client.Animation.Current === "Run" ? math.lerp(Client.Speed.X / Slip + (1 - Slip) * 2, Client.Speed.X, Acceleration) : 1;
			Client.Ground.UngroundedFrames = 0;
		} else {
			if (Client.Ground.UngroundedFrames >= Client.Config.CoyoteFrames) {
				Client.Animation.Current = "Fall";
				Client.State.Current = Client.State.States.Airborne;
			} else Client.Ground.UngroundedFrames++;
		}
	}
}
