import type { Client } from "framework";
import { DecorateState, StateBase } from "./base_state";

/**
 * State which does not apply any collision or physics objects
 *
 * @class
 * @augments StateBase
 */
@DecorateState()
export class StateNone extends StateBase {
	protected CheckInput(_Client: Client) {
		return true;
	}

	protected BeforeUpdateHook(_Client: Client) {
		return true;
	}
}
