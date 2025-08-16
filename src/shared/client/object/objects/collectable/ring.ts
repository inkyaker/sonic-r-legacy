import { Client } from "shared/client";
import SrcObject from "../baseobj";

/**
 * @class
 * @object
 * @augments SrcObject
 */
class Ring extends SrcObject {
    public Triggered: boolean = false

    constructor(Object: Model) {
        super(Object)
    }

    protected OnTouch(Client: Client) {
        if (this.Triggered) { return }
        this.Triggered = true
        Client.CollectState.Rings += 1

        this.SetTransparency(1)
    }

    protected OnRespawn() {
        this.Triggered = false
        this.SetTransparency(1)
    }

    private SetTransparency(Transparency: number) {
        for (const [_, Instance] of pairs(this.Object.GetDescendants())) {
            if (Instance.IsA("BasePart") || Instance.IsA("Decal")) {
                Instance.LocalTransparencyModifier = Transparency
            }
        }
    }
}

export = Ring