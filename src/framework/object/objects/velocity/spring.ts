import { Component } from "@flamework/components";
import type { Client } from "framework";
import { CancelBoost } from "framework/modules/boost";
import { Attributes } from "shared/common/class/attributes";
import { FromToRotation } from "shared/common/utility/cfutil";
import BaseObject from "../baseobj";

type Data = { Force: number; LockTime: number; DirectVelocity: boolean; Wide: boolean };

/**
 * @class
 * @object
 * @augments BaseObject
 */
@Component({ tag: "Spring" })
class Spring extends BaseObject<Model> {
	public Force = 0;
	public LockTime = 0;
	public DirectVelocity = false;
	public Wide = false;
	public Data!: Attributes<Data>;

	public HomingTarget = true;
	public HomingWeight = 2;

	public onStart() {
		this.SetupModel();

		this.Data = Attributes<Data>(this.Object);

		this.Force = this.Data.Force;
		this.LockTime = this.Data.LockTime;
		this.DirectVelocity = this.Data.DirectVelocity;
		this.Wide = this.Data.Wide;

		this.Connections.Add(this.Data("Force").Connect(() => (this.Force = this.Data.Force)));
		this.Connections.Add(this.Data("LockTime").Connect(() => (this.LockTime = this.Data.LockTime)));
		this.Connections.Add(this.Data("DirectVelocity").Connect(() => (this.DirectVelocity = this.Data.DirectVelocity)));
		this.Connections.Add(this.Data("Wide").Connect(() => (this.Wide = this.Data.Wide)));
	}

	public OnTouch(Client: Client) {
		Client.ResetObjectState();

		Client.Speed = new Vector3(0, this.Force, 0);

		Client.Sound.Play("Object/Spring/Activate");

		if (this.Wide) {
			const Offset = this.Root.CFrame.PointToObjectSpace(Client.Position);

			Client.Position = this.Root.CFrame.PointToWorldSpace(new Vector3(math.clamp(Offset.X, -this.Root.Size.X / 2, this.Root.Size.X / 2), 0, 0));
		} else Client.Position = this.Root.Position;

		if (math.abs(this.Root.CFrame.UpVector.Dot(Client.Flags.Gravity.Unit)) >= 0.95)
			Client.Angle = FromToRotation(Client.Angle.UpVector, this.Root.CFrame.UpVector).mul(Client.Angle);
		else Client.Angle = this.Root.GetPivot().Rotation;

		CancelBoost(Client);
		Client.Flags.DirectVelocity = this.DirectVelocity;
		Client.Flags.LockTimer = math.ceil(this.LockTime * 60);
		Client.State.Current = Client.State.States.Airborne;
		Client.Animation.Current = "Spring";
		Client.Ground.Grounded = false;

		this.Debounce = 6;
	}
}

export = Spring;
