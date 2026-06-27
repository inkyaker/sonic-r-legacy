import { Component } from "@flamework/components";
import type { Client } from "framework";
import { Attributes } from "shared/common/class/attributes";
import BaseObject from "../baseobj";

type Data = {
	Speed: number;
	LockTime: number;
	SetSpeed?: boolean;
};

/**
 * @class
 * @object
 * @augments BaseObject
 */
@Component({ tag: "DashPanel" })
class DashPanel extends BaseObject<Model> {
	public Data!: Attributes<Data>;

	public HomingTarget = true;
	public HomingWeight = 0.67;

	public OnStart() {
		this.Data = Attributes<Data>(this.Object);
	}

	public OnTouch(Client: Client) {
		Client.ResetObjectState();
		Client.Sound.Play("Object/DashPanel/Activate");

		Client.Angle = this.Root.GetPivot().Rotation;
		Client.Speed = this.Data.SetSpeed ? Client.Speed.WithX(this.Data.Speed) : Client.Speed.WithX(Client.Speed.X + this.Data.Speed);

		Client.Flags.DirectVelocity = false;
		Client.Flags.LockTimer = math.ceil(this.Data.LockTime * 60);
		Client.Position = this.Root.GetPivot().Position;

		this.Debounce = 25;
	}
}

export = DashPanel;
