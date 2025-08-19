import { Client } from "."
import { StateList } from "./states"
import { FrameworkState } from "shared/common/frameworkstate"
import { SrcState } from "./modules/state"

/**
 * State machine
 * @class
 */
export class StateMachine {
    private Client: Client
    public TickTimer: number
    public States: StateList
    public Current: SrcState

    constructor(Client: Client) {
        this.States = new StateList

        this.TickTimer = os.clock()
        this.Client = Client
        this.Current = this.States.Airborne
    }

    /**
     * Internal method for ticking the current state
     */
    private TickState() {
        this.Current.CheckMoves(this.Client)

        this.Current.Tick(this.Client)
    }

    /**
     * Update the state machine, **only run this if you know what you're doing!**
     */
    public Update(DeltaTime: number) {
        if (FrameworkState.GameSpeed === 0) {
            this.Client.Input.PrepareReset()
            this.Client.Input.Update()
            
            return
        }
        
        // Internal fixed update loop
        this.TickTimer = math.min(this.TickTimer + DeltaTime * (60 * FrameworkState.GameSpeed), 10)
        while (this.TickTimer > 1) {
            // Change input locks
            if (this.Client.Flags.LockTimer > 0) {
                this.Client.Flags.LockTimer -= 1
            }

            this.Client.Input.Update()
            this.Client.Input.PrepareReset()

            this.TickState()
            for (const [_, State] of pairs(this.States)) {
                State.Step(this.Client)
            }

            this.TickTimer -= 1

            this.Client.LastCFrame = this.Client.CurrentCFrame
            this.Client.CurrentCFrame = this.Client.Angle.add(this.Client.Position)
        }
    }
}