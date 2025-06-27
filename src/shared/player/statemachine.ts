import { Constants } from "shared/common/constants"
import { Player } from "."

import { AddLog } from "shared/common/utility/logger"
import { PlayerState, StateList } from "./states"
import { FrameworkState } from "shared/common/frameworkstate"

export type StatesUnion = ExtractKeys<StateList, PlayerState>
export type StatesList = Map<StatesUnion, PlayerState>

const MainMap = new Map<StatesUnion, PlayerState>
for (const [Key, State] of pairs(new StateList)) {
    const Index = identity<StatesUnion>(Key)

    MainMap.set(Index, State)
}

/**
 * State machine
 * @class
 */
export class StateMachine {
    private Player: Player
    public TickTimer: number
    public List: StatesList
    public Current: PlayerState

    constructor(Player: Player) {
        this.List = new Map()

        MainMap.forEach((Value, Index) => {
            this.List.set(Index, Value)
        })

        this.TickTimer = os.clock()
        this.Player = Player
        this.Current = this.Get("Airborne")
    }

    /**
     * Internal method for ticking the current state
     */
    private TickState() {
        this.Current.CheckMoves(this.Player)

        this.Current.Tick(this.Player)
    }

    /**
     * Update the state machine, **only run this if you know what you're doing!**
     */
    public Update(DeltaTime: number) {
        // Generic fixed update loop
        this.TickTimer = math.min(this.TickTimer + DeltaTime * (60 * FrameworkState.GameSpeed), 10)
        while (this.TickTimer > 1) {
            this.Player.Input.PrepareReset()

            this.TickState()
            this.TickTimer -= 1

            this.Player.LastCFrame = this.Player.CurrentCFrame
            this.Player.CurrentCFrame = this.Player.Angle.add(this.Player.Position)
        }
    }

    /**
     * 
     * @param Index State to change to
     * @returns Found PlayerState
     * @throws If invalid state is searched for
     */
    public Get(Index: StatesUnion): PlayerState {
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