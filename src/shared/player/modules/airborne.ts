import { Player } from "shared/player"
import { PhysicsHandler } from "shared/player/physics/physics"
import { CheckBounce } from "./bounce"
import { CheckHomingAttack } from "./homing"
import { StateBase } from "./base"

/**
 * @class
 * @augments StateBase
 */
export class StateAirborne extends StateBase {
    constructor() {
        super()
    }

    protected CheckInput(Player:Player) {
        return CheckHomingAttack(Player) || CheckBounce(Player)
    }

    protected AfterUpdateHook(Player:Player) {
        PhysicsHandler.ApplyGravity(Player) 
        //PhysicsHandler.Turn(Player, Player.Input.GetTurn(Player), undefined)
        PhysicsHandler.AccelerateAirborne(Player)
        PhysicsHandler.AlignToGravity(Player)

        if (Player.Ground.Grounded) {
            if (Player.Flags.IsBounce) {
                Player.Flags.JumpTimer = 0
                
                const Speed = 1 + (math.abs(Player.Speed.X)/16)
                Player.Speed = Player.Speed.mul(new Vector3(1, 0, 1)).add(new Vector3(0, Speed * (Player.Flags.Bounces === 0 && 2.825 || 3.575)))

                Player.Flags.Bounces += 1

                Player.Flags.IsBounce = false
            } else {
                Player.State.Current = Player.State.Get("Grounded")
                Player.Land()
            }
        }
    }
}