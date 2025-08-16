import { Client } from "shared/client"
import { State } from "./state"

/**
 * Rail component interface
 * 
 * @playerComponent
 * @injects Client
 */
export class Rail {
    Rail: BasePart | undefined
    RailDirection: number = 1 // TODO
    RailBalance: number = 0 // TODO
    RailTargetBalance: number = 0 // TODO
    RailOffset: Vector3 = Vector3.zero // TODO
    RailTrick: number = 0 // TODO
    RailSound: Sound | undefined // TODO
    RailGrace: number = 0 // TODO
    RailBonusTime: number = 0 // TODO

    Connections: RBXScriptConnection[] = []
    SpatialMap: undefined // TODO
}

/**
 * 
 * @move
 */
export function CheckRail(Client: Client) {

}

/**
 * @class
 * @state
 * @augments State
 */
export class StateRail extends State {
    constructor() {
        super()
    }

    protected CheckInput(Client: Client) {
    }

    protected AfterUpdateHook(Client: Client) {
    }
}

