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
@Component({ tag: "DashRamp" })
class DashRamp extends BaseObject<Model> {
	public Speed = 0;
	public LockTime = 0;
	public Data!: Attributes<Data>;

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

		Client.Sound.Play("Object/DashRamp/Activate");

		Client.Flags.DirectVelocity = false;
		Client.Flags.LockTimer = math.ceil(this.LockTime * 60);
		Client.Ground.Grounded = false;
		Client.State.Current = Client.State.States.Airborne;

		Client.Angle = this.Root.GetPivot().Rotation;
		Client.Position = this.Root.GetPivot().Position;

		Client.Speed = new Vector3(this.Speed, this.Speed / 1.5, 0);

		this.Debounce = 12;
	}
}

export = DashRamp;
