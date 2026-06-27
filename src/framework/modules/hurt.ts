import type { Client } from "framework";
import { ClientEvents } from "framework/client_networking";
import { PhysicsHandler } from "framework/physics/physics";
import { DecorateState, StateBase } from "./base_state";
import { CheckRail } from "./rail";

/**
 * @class
 * @augments StateBase
 */
@DecorateState()
export class StateHurt extends StateBase {
	public ShouldDie = false;
	public Locked = false;

	protected CheckInput(Client: Client) {
		return !this.ShouldDie && !this.Locked && CheckRail(Client);
	}

	protected BeforeUpdateHook(Client: Client) {
		PhysicsHandler.AlignToGravity(Client);
		PhysicsHandler.ApplyGravity(Client);
		Client.Ground.Grounded = false;
	}

	protected AfterUpdateHook(Client: Client) {
		if (Client.Ground.Grounded) {
			if (this.ShouldDie) {
				if (this.Locked) return;

				Client.Sound.Play("Character/Death")
				Client.Animation.Current = "Die";
				Client.Speed = Vector3.zero;

				this.Locked = true;

				task.delay(2, () => ClientEvents.Respawn());

				return;
			}

			Client.State.Current = Client.State.States.Grounded;
			Client.Animation.Current = "Land";
			Client.Land();
			Client.Speed = Client.Speed.Lerp(Vector3.zero, math.abs(Client.Ground.DotProduct)).mul(0.6);
		} else if (Client.Flags.HurtTime > 0) {
			Client.Flags.HurtTime--;

			if (Client.Flags.HurtTime <= 0) Client.Animation.Current = "Fall";
		}
	}
}
