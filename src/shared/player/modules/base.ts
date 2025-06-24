import { Player } from "shared/player"
import { RunCollision } from "shared/player/physics/collision"

/**
 * State base type
 * @class
 */
export class StateBase {
    /**
     * @constructor
     */
    constructor() {}

    /**
     * Public abstracted method for state input checking, executes before State.Tick
     * 
     * Follows same rules as State.CheckInput
     * @param Player
     */
    public CheckMoves(Player:Player) {
        // Default input checking code

        // Per state code
        this.CheckInput(Player)
    }

    /**
     * Public abstracted method for updating player via BeforeUpdateHook and AfterUpdateHook
     * @param Player Player
     */
    public Tick(Player:Player) {
        // Pre update
        if (this.BeforeUpdateHook(Player) !== undefined) { return }

        // Tick global code in every state
        RunCollision(Player)

        // Post update
        this.AfterUpdateHook(Player)
        Player.Animation.Animate(Player)
    }

    /**
     * Override method for state input checking
     * 
     * States can be changed in this method, and the new state will be Ticked
     * @param Player Player
     */
    protected CheckInput(Player:Player) {
    }

    /**
     * Override method for state update execution
     * 
     * Runs before the global update (Collision)
     * @param Player Player
     * @returns {true|undefined} If returned true will cancel the tick, skipping Collision, AfterUpdateHook, and Animate
     */
    protected BeforeUpdateHook(Player:Player):boolean|undefined|void {
    }

    /**
     * Override method for state update execution
     * 
     * Runs after the global update (Collision) and BeforeUpdateHook
     * @param Player Player
     */
    protected AfterUpdateHook(Player:Player) {
    }
}