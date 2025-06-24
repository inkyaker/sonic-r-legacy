import { Player } from "shared/player"
import { PhysicsHandler } from "shared/player/physics/physics"
import { StateBase } from "./base"

/**
 * Function ran in `State.CheckInput`
 * @move
 * @param Player 
 * @returns Move successful
 */
export function CheckSkid(Player:Player) {
    const [HasControl, Turn] = Player.Input.Get(Player)

    const Skid = HasControl && (math.abs(Turn) > math.rad(135)) || false

    if (Skid) {
        Player.Animation.Current = "Skid"
        Player.State.Current = Player.State.Get("Skid")
    }

    return Skid
}

/**
 * Function ran in `State.CheckInput`
 * @move
 * @param Player 
 * @returns Move successful
 */
export function CheckStopSkid(Player:Player) {
    if (Player.Speed.X <= .01) {
        Player.Speed = Player.Speed.mul(new Vector3(0, 1, 1))
        Player.State.Current = Player.State.Get("Grounded")
        
        return true
    } else {
        const [HasControl, Turn] = Player.Input.Get(Player)
        const StopSkid = HasControl && (math.abs(Turn) <= math.rad(135)) || false

        if (StopSkid) {
            Player.State.Current = Player.State.Get("Grounded")
        }

        return StopSkid
    }
}

/**
 * @class
 * @state
 * @augments StateBase
 */
export class StateSkid extends StateBase {
    constructor() {
        super()
    }

    protected CheckInput(Player:Player) {
        return CheckStopSkid(Player)
    }

    protected AfterUpdateHook(Player:Player) {
        PhysicsHandler.ApplyGravity(Player)
        PhysicsHandler.Skid(Player)
    }
}

