import { Player } from "shared/player";
import { BaseObj } from "../baseobj";
import { Attributes } from "shared/common/class/attributes";

/**
 * @class
 * @object
 * @augments BaseObj
 */
export class DashPanel extends BaseObj {
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
        const LookVector = this.Root.GetPivot().LookVector

        Player.Angle = this.Root.GetPivot().Rotation
        Player.Speed = Player.Speed.add(LookVector.mul(this.Speed))
        Player.Flags.DirectVelocity = false
        Player.Flags.LockTimer = this.LockTime
        Player.Position = this.Root.GetPivot().Position

        this.Debounce = 25
    }

    protected OnDestroy() {

    }
}