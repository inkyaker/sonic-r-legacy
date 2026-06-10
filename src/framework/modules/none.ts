import type { Client } from "framework";
import { BaseState } from "./state";

/**
 * State which does not apply any collision or physics objects
 *
 * @class
 * @augments BaseState
 */
export class StateNone extends BaseState {
	protected CheckInput(_Client: Client) {
		return true;
	}

	protected BeforeUpdateHook(_Client: Client) {
		return true;
	}
}
