import { Player } from "shared/player"
import { StateBase } from "./base"

/**
 * State which does not apply any collision or physics objects
 * 
 * @class
 * @augments StateBase
 */
export class StateNone extends StateBase {
    constructor() {
        super()
    }

    protected CheckInput(Player:Player) {
        return true
    }

    protected BeforeUpdateHook(Player: Player) {
        return true
    }
}