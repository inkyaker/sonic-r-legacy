import type { Client } from "framework";

/**
 * Function ran in `State.CheckInput`
 * @move
 * @param Client
 * @returns Move successful
 */
export function CheckBounce(Client: Client) {
	if (Client.Flags.BallEnabled && Client.Input.Button.Bounce.DidPress) {
		Client.Flags.InBounce = true;
		Client.Animation.Current = "Roll";
		Client.Speed = Client.Speed.mul(new Vector3(0.75, 0, 1)).sub(new Vector3(0, (Client.Flags.Bounces === 0 && 5) || 7, 0));

		return true;
	}
}
