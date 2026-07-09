import { Component } from "@flamework/components";
import type { Client } from "framework";
import { Attributes } from "shared/common/class/attributes";
import { SetGameSpeed } from "shared/common/frameworkstate";
import BaseObject from "../baseobj";

type Data = { Timescale: number; Reusable: boolean };

/**
 * @class
 * @object
 * @augments BaseObject
 */
@Component({ tag: "TimeSlow" })
export class TimeSlow extends BaseObject<Model> {
	public Triggered = false;
	public Data!: Attributes<Data>;
	public OnStart() {
		this.Data = Attributes<Data>(this.Object);
	}

	public OnTouch(_Client: Client) {
		this.Debounce = this.Data.Reusable ? 5 * 60 : math.huge;
		SetGameSpeed(this.Data.Timescale);

		this.Triggered = true;
	}

	public Respawn() {
		this.Triggered = false;
		this.Debounce = 0;
	}

	public Serialize() {
		return {
			Triggered: this.Triggered,
		};
	}

	public Deserialize(Data: unknown) {
		this.Triggered = (Data as { Triggered: boolean }).Triggered;

		if (this.Triggered && !this.Data.Reusable) this.Debounce = math.huge;
	}
}
