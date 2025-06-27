import { Player } from "shared/player";
import { BaseObj } from "../baseobj";
import { Attributes } from "shared/common/class/attributes";

/**
 * @class
 * @object
 * @augments BaseObj
 */
export class Spring extends BaseObj {
    public Force = 0
    public LockTime = 0
    public DirectVelocity = false
    public Data

    constructor(Object: Model) {
        super(Object)

        this.Data = Attributes<{ Force: number, LockTime: number, DirectVelocity: boolean }>(Object)

        this.Force = this.Data.Force
        this.LockTime = this.Data.LockTime
        this.DirectVelocity = this.Data.DirectVelocity

        this.Connections.Add(this.Data("Force").Connect(() => this.Force = this.Data.Force))
        this.Connections.Add(this.Data("LockTime").Connect(() => this.LockTime = this.Data.LockTime))
        this.Connections.Add(this.Data("DirectVelocity").Connect(() => this.DirectVelocity = this.Data.DirectVelocity))
    }

    protected OnTouch(Player: Player) {
        Player.Speed = new Vector3(0, this.Force, 0)
        Player.Position = this.Root.Position
        Player.Angle = this.Root.GetPivot().Rotation
        Player.Flags.DirectVelocity = this.DirectVelocity
        Player.Flags.LockTimer = this.LockTime

        this.Debounce = 6
    }

    protected OnDestroy() {

    }
}