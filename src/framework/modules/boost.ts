import type { Client } from "framework";
import { GetWallDot } from "framework/physics/collision";

export function CalculateBoostSpeed(Client: Client) {
	const LastBoosting = Client.Flags.BoostTicks > 1;
	const CurrentSpeed = Client.Speed.X;
	const TargetSpeed = (6.7 + math.min(Client.Flags.BoostTicks, 300) / 100) * (1 - GetWallDot(Client));
	let FinalSpeed = !LastBoosting ? TargetSpeed : CurrentSpeed + math.clamp(TargetSpeed - CurrentSpeed, 0, 0.1);

	return Client.Speed.WithX(FinalSpeed);
}

export function StepBoost(Client: Client) {
	Client.Flags._BoostTicked = true;

	const WasBoosting = Client.Flags.Boosting;
	Client.Flags.Boosting = Client.Input.Button.Boost.IsDown && !Client.Flags.InBounce && !Client.Flags.BoostDisabled;
	if (Client.Flags.Boosting) {
		if (!WasBoosting) {
			Client.Sound.Play("Character/BoostCharge");
			Client.Sound.Play("Character/BoostWind");
			Client.Sound.Play("Character/BoostStart");
		}

		Client.Flags.BoostTicks++;
		if (Client.Flags.LockTimer <= 0) Client.Speed = CalculateBoostSpeed(Client);

		if (Client.State.Current.GetID() === "StateAirborne") {
			Client.Animation.Current = "AirBoost";
			Client.Flags.JumpTimer = 0;
		}
	} else if (Client.Flags.BoostTicks > 0) CancelBoost(Client);
}

export function CancelBoost(Client: Client) {
	Client.Sound.Stop("Character/BoostCharge");
	Client.Sound.Stop("Character/BoostWind");

	Client.Flags.Boosting = false;
	Client.Flags.BoostTicks = 0;
}
