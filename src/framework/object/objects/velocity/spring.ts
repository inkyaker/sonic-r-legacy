import { Client } from "framework";
import SrcObject from "../baseobj";
import { Attributes } from "shared/common/class/attributes";

/**
 * @class
 * @object
 * @augments SrcObject
 */
class Spring extends SrcObject {
    public Force = 0
    public LockTime = 0
    public DirectVelocity = false
    public Data

    constructor(Object: Model) {
        super(Object)

        this.Data = Attributes<{ Force: number, LockTime: number, DirectVelocity: boolean, Wide: boolean }>(Object)

        this.Force = this.Data.Force
        this.LockTime = this.Data.LockTime
        this.DirectVelocity = this.Data.DirectVelocity

        this.Connections.Add(this.Data("Force").Connect(() => this.Force = this.Data.Force))
        this.Connections.Add(this.Data("LockTime").Connect(() => this.LockTime = this.Data.LockTime))
        this.Connections.Add(this.Data("DirectVelocity").Connect(() => this.DirectVelocity = this.Data.DirectVelocity))
    }

    protected OnTouch(Client: Client) {
        Client.Speed = new Vector3(0, this.Force, 0)
        Client.Position = this.Root.Position
        Client.Angle = this.Root.GetPivot().Rotation
        Client.Flags.DirectVelocity = this.DirectVelocity
        Client.Flags.LockTimer = math.ceil(this.LockTime * 60)

        this.Debounce = 6
    }
}

export = Spring