import type { Client } from "framework";

/**
 * Function ran in `State.CheckInput`
 * @move
 * @param Client
 * @returns Move successful
 */
export function CheckJump(Client: Client) {
	if (Client.Input.Button.Jump.DidPress) {
		if (Client.State.Current.Is("StateRail")) {
			if (math.abs(Client.Input.GetTurn()) >= math.rad(135)) {
				Client.Rail.RailDirection *= -1;
				Client.Rail.RailJumpTime = 8;
				Client.Sound.Play("Character/Jump");
				Client.Speed = Client.Speed.WithX(-Client.Speed.X);

				return;
			}
		}

		Client.State.Current = Client.State.States.Airborne;
		Client.Speed = Client.Speed.add(new Vector3(0, Client.Config.JumpInitalForce, 0));

		Client.Ground.Grounded = false;
		Client.Flags.JumpTimer = Client.Config.JumpTicks;

		Client.EnterBall();
		Client.Animation.Current = "Roll";
		Client.Animation.Speed = Client.Speed.Magnitude;

		Client.Sound.Play("Character/Jump");

		return true;
	}
}
