import type { DSClient } from "framework";
import { SrcState } from "./state";

/**
 * State which does not apply any collision or physics objects
 *
 * @class
 * @augments SrcState
 */
export class StateNone extends SrcState {
	protected CheckInput(_Client: DSClient) {
		return true;
	}

	protected BeforeUpdateHook(_Client: DSClient) {
		return true;
	}
}
