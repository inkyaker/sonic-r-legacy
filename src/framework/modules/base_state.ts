import { Modding, Reflect } from "@flamework/core";
import type { Client } from "framework";
import { RunCollision } from "framework/physics/collision";

export const DecorateState = Modding.createDecorator("Class", (Descriptor, _) => {
	Reflect.defineMetadata(Descriptor.object, "swirl:object", true);
	Reflect.defineMetadata(Descriptor.object, "swirl:state_id", `${Descriptor.constructor}`);
});

/**
 * State base type
 * @class
 */
@DecorateState()
export class StateBase {
	/**
	 * Get state ID
	 */
	public GetID() {
		return Reflect.getMetadata(this, "swirl:state_id") as string;
	}

	public Is(Name: string) {
		return this.GetID() === Name;
	}

	public DefineTransition<T extends StateBase>(Direction: "To" | "From", State: T | "All", Callback: (Client: Client) => void) {
		this.Transitions[Direction].push({ State: State, Callback: Callback });
	}

	public Transitions = {
		To: [] as Array<{ State: StateBase | "All"; Callback: (Client: Client) => void }>,
		From: [] as Array<{ State: StateBase | "All"; Callback: (Client: Client) => void }>,
	};

	/**
	 * Public abstracted method for state input checking, executes before State.Tick
	 *
	 * Follows same rules as State.CheckInput
	 * @param Client
	 */
	public CheckMoves(Client: Client) {
		// Per state code
		this.CheckInput(Client);
	}

	/**
	 * Public abstracted method for updating player via BeforeUpdateHook and AfterUpdateHook
	 * @param Client Client
	 */
	public Tick(Client: Client) {
		// Pre update
		if (this.BeforeUpdateHook(Client) !== undefined) return;

		// Tick global code in every state
		RunCollision(Client);

		// Account for object state changes
		if (Client.State.Current === this) {
			this.AfterUpdateHook(Client);
		} else {
			Client.State.Current.AfterUpdateHook(Client);
		}

		Client.Animation.Animate(Client);
	}

	/**
	 * Specialized function designed for per-state cooldown management.
	 *
	 * Look at rails for reference
	 *
	 * Runs every tick after state update
	 * @param Client
	 */
	public Step(Client: Client) {
		this.OnStep(Client);
	}

	/**
	 * Override method for state input checking
	 *
	 * States can be changed in this method, and the new state will be Ticked
	 * @param Client Client
	 */
	protected CheckInput(_Client: Client) {}

	/**
	 * Override method for state update execution
	 *
	 * Runs before the global update (Collision)
	 * @param Client Client
	 * @returns {true|undefined} If returned true will cancel the tick, skipping Collision, AfterUpdateHook, and Animate
	 */
	protected BeforeUpdateHook(_Client: Client) {}

	/**
	 * Override method for state update execution
	 *
	 * Runs after the global update (Collision) and BeforeUpdateHook
	 * @param Client Client
	 */
	protected AfterUpdateHook(_Client: Client) {}

	/**
	 * Function ran on player step for all states, do not include performance intensive code
	 *
	 * Useful for per-state timer resets
	 * @param Client Client
	 */
	protected OnStep(_Client: Client) {}
}
