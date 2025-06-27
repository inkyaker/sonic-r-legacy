import { Player } from "shared/player";
import { BaseObj } from "../baseobj";
import { Attributes } from "shared/common/class/attributes";

/**
 * @class
 * @object
 * @augments BaseObj
 */
export class DashRamp extends BaseObj {
    public Speed = 0
    public LockTime = 0
    public Data

    constructor(Object: Model) {
        super(Object)
        this.Data = Attributes<{ Speed: number, LockTime: number }>(Object)

        this.Speed = this.Data.Speed
        this.LockTime = this.Data.LockTime

        this.Connections.Add(this.Data("Speed").Connect(() => this.Speed = this.Data.Speed))
        this.Connections.Add(this.Data("LockTime").Connect(() => this.LockTime = this.Data.LockTime))
    }

    protected OnTouch(Player: Player) {
        Player.Flags.DirectVelocity = false
        Player.Flags.LockTimer = this.LockTime

        Player.Angle = this.Root.GetPivot().Rotation
        Player.Position = this.Root.GetPivot().Position

        Player.Speed = new Vector3(this.Speed, this.Speed / 1.5, 0)

        this.Debounce = 12
    }

    protected OnDestroy() {

    }
}