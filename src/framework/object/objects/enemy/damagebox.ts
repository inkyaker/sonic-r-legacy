import type { DSClient } from "framework";
import { Attributes } from "shared/common/class/attributes";
import SrcObject from "../baseobj";

/**
 * @class
 * @object
 * @augments SrcObject
 */
class DamageBox extends SrcObject {
	public Enabled: boolean = true;
	public Data;

	constructor(Object: Model) {
		super(Object);

		this.Data = Attributes<{ Enabled: boolean }>(Object);

		this.Enabled = this.Data.Enabled;

		this.Connections.Add(this.Data("Enabled").Connect(() => (this.Enabled = this.Data.Enabled)));
	}

	protected OnTouch(Client: DSClient) {
		if (!this.Enabled) {
			return;
		}
		this.Debounce = 30;

		Client.Damage(this.Root.Position);
	}
}

export = DamageBox;
