import { StateSkid } from "./modules/skid"
import { StateSpindash, StateRoll } from "./modules/spindash"
import { StateAirborne } from "./modules/airborne"
import { StateGrounded } from "./modules/grounded"
import { StateNone } from "./modules/none"
import { StateRail } from "./modules/rail"

/**
 * List of all states for `StateMachine`
 * @class
 */
export class StateList {
    // Physics states
    public None = new StateNone
    public Airborne = new StateAirborne
    public Grounded = new StateGrounded

    // Move states
    public Spindash = new StateSpindash
    public Roll = new StateRoll
    public Skid = new StateSkid
    public Rail = new StateRail
}