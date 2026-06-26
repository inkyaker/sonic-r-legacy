import { Component } from "@flamework/components";
import type { Client } from "framework";
import { Attributes } from "shared/common/class/attributes";
import BaseObject from "../baseobj";

type Data = {
	Speed: number;
	LockTime: number;
	Rainbow: boolean;
};

/**
 * @class
 * @object
 * @augments BaseObject
 */
@Component({ tag: "DashRing" })
class DashRing extends BaseObject<Model> {
	public Speed = 0;
	public LockTime = 0;
	public Rainbow = false;
	public Data!: Attributes<Data>;

	public OnStart() {
		this.Data = Attributes<Data>(this.Object);

		this.Speed = this.Data.Speed;
		this.LockTime = this.Data.LockTime;
		this.Rainbow = this.Data.Rainbow;

		this.Connections.Add(this.Data("Speed").Connect(() => (this.Speed = this.Data.Speed)));
		this.Connections.Add(this.Data("LockTime").Connect(() => (this.LockTime = this.Data.LockTime)));
		this.Connections.Add(this.Data("Rainbow").Connect(() => (this.Rainbow = this.Data.Rainbow)));
	}

	public OnTouch(Client: Client) {
		Client.ResetObjectState();

		Client.Sound.Play(`Object/${this.Rainbow ? "Rainbow" : "Dash"}Ring/Activate`);

		Client.Speed = new Vector3(this.Speed, 0, 0);
		Client.Angle = this.Root.GetPivot().Rotation;
		Client.Position = this.Root.GetPivot().Position;
		Client.Flags.DirectVelocity = true;
		Client.Flags.LockTimer = math.ceil(this.LockTime * 60);
		Client.State.Current = Client.State.States.Airborne;
		Client.Ground.Grounded = false;

		this.Debounce = 25;
	}
}

export = DashRing;
