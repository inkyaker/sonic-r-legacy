import type { Client } from "framework";
import { PhysicsHandler } from "framework/physics/physics";
import { SignedAngle } from "shared/common/utility/vutil";
import { DecorateState, StateBase } from "./base_state";
import { CheckBounce } from "./bounce";

/**
 * Update homing object for UI & homing attack
 * @param Client
 */
export function UpdateHomingObject(Client: Client) {
	Client.HomingAttack.Ticked = true;
	Client.HomingAttack.Target = PhysicsHandler.GetHomingObject(Client);
}

/**
 * Function ran in `State.CheckInput`
 * @move
 * @param Client
 * @returns Move successful
 */
export function CheckHomingAttack(Client: Client) {
	if (Client.Input.Button.HomingAttack.DidPress && Client.Flags.BallEnabled) {
		const Object = Client.HomingAttack.Target;
		Client.Sound.Play("Character/Dash");
		PhysicsHandler.TurnToStick(Client);

		if (Object) {
			Client.EnterBall();
			Client.Animation.Current = "Roll";
			Client.HomingAttack.Timer = 0;

			Client.State.Current = Client.State.States.Homing;
			Client.HomingAttack.Speed = math.max(Client.Speed.Magnitude, Client.Config.HomingForce.HomingAttack);
		} else {
			Client.Animation.Current = "Fall";
			Client.ExitBall();

			Client.State.Current = Client.State.States.Airborne;
		}

		Client.Flags.TrailEnabled = true;

		Client.Speed = Client.Config.HomingForce.AirDash.Max(Client.Speed.WithZ(0));

		return true;
	}
}

/**
 * @class
 * @augments StateBase
 */
@DecorateState()
export class StateHoming extends StateBase {
	protected CheckInput(Client: Client) {
		return CheckBounce(Client);
	}

	protected BeforeUpdateHook(Client: Client) {
		Client.HomingAttack.Ticked = true;
		Client.Angle = CFrame.fromRotationBetweenVectors(Client.Angle.UpVector, Vector3.yAxis).mul(Client.Angle);

		const Collider = Client.HomingAttack.Target!.Root;
		const Middle = Client.GetMiddle();
		const Center = Client.HomingAttack.Target!.GetCenter();

		const [MiddleFlat, CenterFlat] = [Middle.WithY(0), Center.WithY(0)];
		if (MiddleFlat.Distance(CenterFlat) >= 0.0001) {
			const MaxTurn = math.rad(65) * (1 + Client.HomingAttack.Timer / 180);
			const Turn = SignedAngle(Client.Angle.LookVector, Center.sub(Middle).mul(new Vector3(1, 0, 1)).Unit, Vector3.yAxis);

			PhysicsHandler.TurnRaw(Client, math.clamp(Turn, -MaxTurn, MaxTurn));
		}

		const ObjectPos = new CFrame(Middle).mul(Client.Angle).Inverse().mul(Center);
		const ObjectPosSpeed = new CFrame(Middle.add(Client.ToGlobal(Client.Speed.mul(Client.Config.Scale)))).mul(Client.Angle).Inverse().mul(Center);

		// Speed
		const Speed = Client.HomingAttack.Speed * (Client.HomingAttack.Timer >= 180 ? 0.7 + math.random() * 0.1 : 1);

		if (ObjectPos.Magnitude <= Collider.Size.Magnitude / 2 || ObjectPosSpeed.Magnitude <= Collider.Size.Magnitude / 2) {
			Client.HomingAttack.Target!.TouchClient(Client);

			Client.HomingAttack.Timer += 300;
		} else if (ObjectPos.Magnitude > 0) {
			const ObjectSpeed = ObjectPos.Unit;
			const ForwardSpeed = ObjectSpeed.mul(new Vector3(1, 0, 1)).Magnitude;

			Client.Speed = new Vector3(ForwardSpeed * Speed, ObjectSpeed.Y * Speed, 0);
		}

		Client.HomingAttack.Timer++;

		if (Client.HomingAttack.Timer >= 300 && Client.State.Current.Is("StateHoming")) {
			Client.State.Current = Client.State.States.Airborne;

			Client.HomingAttack.Target = undefined;
			Client.HomingAttack.Timer = 0;
		}
	}

	protected AfterUpdateHook(_Client: Client) {}
}
