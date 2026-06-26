import { StateAirborne } from "./modules/airborne";
import { StateGrounded } from "./modules/grounded";
import { StateHoming } from "./modules/homing";
import { StateHurt } from "./modules/hurt";
import { StateNone } from "./modules/none";
import { StateRail } from "./modules/rail";
import { StateSkid } from "./modules/skid";
import { StateSlide } from "./modules/slide";
import { StateStomp } from "./modules/stomp";

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
	public Skid = new StateSkid();
	public Rail = new StateRail();
	public Homing = new StateHoming();
	public Stomp = new StateStomp();
	public Slide = new StateSlide();
}
