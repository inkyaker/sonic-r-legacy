import { Component } from "@flamework/components";
import type { Client } from "framework";
import { Attributes } from "shared/common/class/attributes";
import BaseObject from "../baseobj";

type Data = {
	Enabled: boolean;
};

/**
 * @class
 * @object
 * @augments BaseObject
 */
@Component({ tag: "DamageBox" })
class DamageBox extends BaseObject<Model> {
	public Enabled: boolean = true;
	public Data!: Attributes<Data>;

	public OnStart() {
		this.Data = Attributes<Data>(this.Object);
		this.Enabled = this.Data.Enabled;
		this.Connections.Add(this.Data("Enabled").Connect(() => (this.Enabled = this.Data.Enabled)));
	}

	public OnTouch(Client: Client) {
		if (!this.Enabled) return;

		this.Debounce = 30;
		Client.Damage(this.Root.Position);
	}
}

export = DamageBox;
