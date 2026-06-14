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
	Client.Flags.Boosting = Client.Input.Button.Boost.IsDown && !Client.Flags.LockTimer;
	if (Client.Flags.Boosting) {
		Client.Flags.BoostTicks++;
		Client.Speed = CalculateBoostSpeed(Client);
	} else if (Client.Flags.BoostTicks > 0) Client.Flags.BoostTicks = 0;

	if (Client.Flags.Boosting && Client.State.Current === Client.State.States.Airborne) Client.Animation.Current = "AirBoost";
}

export function CancelBoost(Client: Client) {
	Client.Flags.Boosting = false;
	Client.Flags.BoostTicks = 0;
}
