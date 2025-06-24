import { StateSkid } from "./modules/skid"
import { StateSpindash, StateRoll } from "./modules/spindash"
import { StateAirborne } from "./modules/airborne"
import { StateBase } from "./modules/base"
import { StateGrounded } from "./modules/grounded"
import { StateNone } from "./modules/none"

export type PlayerState = StateBase

/**
 * List of all states for `StateMachine`
 * @class
 */
export class StateList {
    // Physical states
    private Base = new StateBase
    public None = new StateNone
    public Airborne = new StateAirborne
    public Grounded = new StateGrounded
    
    // Move states
    public Spindash = new StateSpindash
    public Roll = new StateRoll
    public Skid = new StateSkid
}