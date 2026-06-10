import { StateAirborne } from "./modules/airborne";
import { StateGrounded } from "./modules/grounded";
import { StateHoming } from "./modules/homing";
import { StateHurt } from "./modules/hurt";
import { StateNone } from "./modules/none";
import { StateRail } from "./modules/rail";
import { StateSkid } from "./modules/skid";
import { StateRoll, StateSpindash } from "./modules/spindash";

/**
 * List of all states for `StateMachine`
 * @class
 */
export class StateList {
	// Physics states
	public None = new StateNone();
	public Airborne = new StateAirborne();
	public Grounded = new StateGrounded();
	public Hurt = new StateHurt();

	// Move states
	public Spindash = new StateSpindash();
	public Roll = new StateRoll();
	public Skid = new StateSkid();
	public Rail = new StateRail();
	public Homing = new StateHoming()
}
