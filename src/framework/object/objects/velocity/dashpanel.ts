import { Component } from "@flamework/components";
import type { Client } from "framework";
import { Attributes } from "shared/common/class/attributes";
import BaseObject from "../baseobj";

type Data = {
	Speed: number;
	LockTime: number;
};

/**
 * @class
 * @object
 * @augments BaseObject
 */
@Component({ tag: "DashPanel" })
class DashPanel extends BaseObject<Model> {
	public Speed = 0;
	public LockTime = 0;
	public Data!: Attributes<Data>;

	public HomingTarget = true;
	public HomingWeight = 0.67;

	public onStart() {
		this.SetupModel();

		this.Data = Attributes<Data>(this.Object);

		this.Speed = this.Data.Speed;
		this.LockTime = this.Data.LockTime;

		this.Connections.Add(this.Data("Speed").Connect(() => (this.Speed = this.Data.Speed)));
		this.Connections.Add(this.Data("LockTime").Connect(() => (this.LockTime = this.Data.LockTime)));
	}

	public OnTouch(Client: Client) {
		Client.ResetObjectState();

		Client.Sound.Play("Object/DashPanel/Activate");

		Client.Angle = this.Root.GetPivot().Rotation;

		const LookVector = Client.ToLocal(this.Root.GetPivot().LookVector);
		Client.Speed = Client.Speed.add(LookVector.mul(this.Speed));

		Client.Flags.DirectVelocity = false;
		Client.Flags.LockTimer = math.ceil(this.LockTime * 60);
		Client.Position = this.Root.GetPivot().Position;

		this.Debounce = 25;
	}
}

export = DashPanel;
