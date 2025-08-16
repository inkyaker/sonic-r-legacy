import { Constants } from "shared/common/constants"
import { Client } from "."

import { AddLog } from "shared/common/utility/logger"
import { StateList } from "./states"
import { FrameworkState } from "shared/common/frameworkstate"
import { State } from "./modules/state"

export type StatesUnion = ExtractKeys<StateList, State>
export type StatesList = Map<StatesUnion, State>

const MainMap = new Map<StatesUnion, State>
for (const [Key, State] of pairs(new StateList)) {
    const Index = identity<StatesUnion>(Key)

    MainMap.set(Index, State)
}

/**
 * State machine
 * @class
 */
export class StateMachine {
    private Client: Client
    public TickTimer: number
    public List: StatesList
    public Current: State

    constructor(Client: Client) {
        this.List = new Map()

        MainMap.forEach((Value, Index) => {
            this.List.set(Index, Value)
        })

        this.TickTimer = os.clock()
        this.Client = Client
        this.Current = this.Get("Airborne")
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
        // Generic fixed update loop
        this.TickTimer = math.min(this.TickTimer + DeltaTime * (60 * FrameworkState.GameSpeed), 10)
        while (this.TickTimer > 1) {
            this.Client.Input.PrepareReset()

            this.TickState()
            this.TickTimer -= 1

            this.Client.LastCFrame = this.Client.CurrentCFrame
            this.Client.CurrentCFrame = this.Client.Angle.add(this.Client.Position)
        }
    }

    /**
     * 
     * @param Index State to change to
     * @returns Found State
     * @throws If invalid state is searched for
     */
    public Get(Index: StatesUnion): State {
        const Pick = this.List.get(Index)

        if (Pick !== undefined) {
            return Pick
        } else {
            const LogText = `Attempted to get valid state, state not found? ${Index}`
            AddLog(LogText)
            error(LogText)
        }
    }
}