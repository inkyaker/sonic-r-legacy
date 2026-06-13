import type { Client } from "framework";
import { PhysicsHandler } from "framework/physics/physics";
import { SignedAngle } from "shared/common/utility/vutil";
import { CheckBounce } from "./bounce";
import { BaseState } from "./state";

/**
 * Function ran in `State.CheckInput`
 * @move
 * @param Client
 * @returns Move successful
 */
export function CheckHomingAttack(Client: Client) {
	if (Client.Input.Button.Jump.Pressed && Client.Flags.BallEnabled) {
		const Object = PhysicsHandler.GetHomingObject(Client);
		Client.Sound.Play("Character/Dash");
		
		if (Object) {
			Client.EnterBall();
			Client.Animation.Current = "Roll";
			Client.HomingAttack.Target = Object;
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
 * @augments BaseState
 */
export class StateHoming extends BaseState {
	protected CheckInput(Client: Client) {
		return CheckBounce(Client);
	}

	protected BeforeUpdateHook(Client: Client) {
		Client.Angle = CFrame.fromRotationBetweenVectors(Client.Angle.UpVector, Vector3.yAxis).mul(Client.Angle);

		const Collider = Client.HomingAttack.Target!.Root;

		const Center = Collider.Position;
		const Look = Center.sub(Client.Position).mul(new Vector3(1, 0, 1)).Unit;

		const MaxTurn = math.rad(35.25) * (1 + Client.HomingAttack.Timer / 180);
		const Turn = SignedAngle(Client.Angle.LookVector, Look, Vector3.yAxis);

		PhysicsHandler.Turn(Client, math.clamp(Turn, -MaxTurn, MaxTurn));

		const ObjectPos = new CFrame(Client.Position).mul(Client.Angle).Inverse().mul(Center);
		const ObjectPosSpeed = new CFrame(Client.Position.add(Client.ToGlobal(Client.Speed.mul(Client.Config.Scale)))).mul(Client.Angle).Inverse().mul(Center);

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

		if (Client.HomingAttack.Timer >= 300) {
			Client.State.Current = Client.State.States.Airborne;

			Client.HomingAttack.Target = undefined;
			Client.HomingAttack.Timer = 0;
		}
	}

	protected AfterUpdateHook(_Client: Client) {}
}
