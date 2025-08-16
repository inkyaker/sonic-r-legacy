import { Client } from "shared/client"
import { State } from "./state"

/**
 * State which does not apply any collision or physics objects
 * 
 * @class
 * @augments State
 */
export class StateNone extends State {
    constructor() {
        super()
    }

    protected CheckInput(Client: Client) {
        return true
    }

    protected BeforeUpdateHook(Client: Client) {
        return true
    }
}