import type { Client } from "framework";
import { Attributes } from "shared/common/class/attributes";
import BaseObject from "../baseobj";

/**
 * @class
 * @object
 * @augments BaseObject
 */
class DamageBox extends BaseObject {
	public Enabled: boolean = true;
	public Data;

	constructor(Object: Model) {
		super(Object);

		this.Data = Attributes<{ Enabled: boolean }>(Object);

		this.Enabled = this.Data.Enabled;

		this.Connections.Add(this.Data("Enabled").Connect(() => (this.Enabled = this.Data.Enabled)));
	}

	protected OnTouch(Client: Client) {
		if (!this.Enabled) {
			return;
		}
		this.Debounce = 30;

		Client.Damage(this.Root.Position);
	}
}

export = DamageBox;
