import { Attributes } from "shared/common/class/attributes";
import DamageBox from "./damagebox";

/**
 * @class
 * @object
 * @augments DamageBox
 * @augments BaseObj
 */
class SpikeTrap extends DamageBox {
    public Data
    public State: boolean = false
    public TickProgress: number = 0
    public CycleLength: number = 0
    public Permanant: boolean = false

    constructor(Object: Model) {
        super(Object)

        this.Data = Attributes<{ CycleLength: number, Permanant: boolean }>(Object)
        this.CycleLength = this.Data.CycleLength
        this.Permanant = this.Data.Permanant

        this.Connections.Add(this.Data("CycleLength").Connect(() => this.CycleLength = this.Data.CycleLength))
        this.Connections.Add(this.Data("Permanant").Connect(() => {
            this.Permanant = this.Data.Permanant

            if (this.Permanant) {
                this.State = true
                this.UpdateState()
            }
        }))

        if (this.Permanant) {
            this.State = true
        }
        
        this.UpdateState()
    }

    protected OnTick() {
        if (this.Permanant) { return }

        this.TickProgress += 1

        if (this.TickProgress >= this.CycleLength) {
            this.TickProgress -= this.CycleLength

            this.State = !this.State

            this.UpdateState()
        }
    }

    protected UpdateState() {
        // TODO: change model

        this.Enabled = this.State
    }

    protected OnRespawn() {
        this.State = this.Permanant && true || false
        this.TickProgress = 0
        this.UpdateState()
    }
}

export = SpikeTrap