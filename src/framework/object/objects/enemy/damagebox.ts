import { Client } from "framework";
import SrcObject from "../baseobj";
import { Attributes } from "shared/common/class/attributes";

/**
 * @class
 * @object
 * @augments SrcObject
 */
class DamageBox extends SrcObject {
    public Enabled: boolean = true

    constructor(Object: Model) {
        super(Object)
    }

    protected OnTouch(Client: Client) {
        if (!this.Enabled) { return }
        this.Debounce = 30

        Client.Damage(this.Root.Position)
    }
}

export = DamageBox