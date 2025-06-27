import { Player } from "shared/player"
import { StateBase } from "./base"

/**
 * Rail component interface
 * 
 * @component
 * @injects Player
 */
export class Rail {
    Rail: BasePart|undefined
    RailDirection: number = 1 // TODO
    RailBalance: number = 0 // TODO
    RailTargetBalance: number = 0 // TODO
    RailOffset: Vector3 = Vector3.zero // TODO
    RailTrick: number = 0 // TODO
    RailSound: Sound|undefined // TODO
    RailGrace: number = 0 // TODO
    RailBonusTime: number = 0 // TODO

    Connections: RBXScriptConnection[] = []
    SpatialMap: undefined // TODO
}

/**
 * 
 * @move
 */
export function CheckRail(Player:Player) {

}

/**
 * @class
 * @state
 * @augments StateBase
 */
export class StateRail extends StateBase {
    constructor() {
        super()
    }

    protected CheckInput(Player:Player) {
    }

    protected AfterUpdateHook(Player:Player) {
    }
}

