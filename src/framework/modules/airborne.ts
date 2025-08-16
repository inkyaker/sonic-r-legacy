import { Client } from "framework"
import { PhysicsHandler } from "framework/physics/physics"
import { CheckBounce } from "./bounce"
import { CheckHomingAttack } from "./homing"
import { SrcState } from "./state"
import { CheckRail } from "./rail"

/**
 * @class
 * @augments SrcState
 */
export class StateAirborne extends SrcState {
    constructor() {
        super()
    }

    protected CheckInput(Client: Client) {
        return CheckHomingAttack(Client) || CheckBounce(Client) || CheckRail(Client)
    }

    protected AfterUpdateHook(Client: Client) {
        PhysicsHandler.ApplyGravity(Client)
        //PhysicsHandler.Turn(Client, Client.Input.GetTurn(), undefined)
        PhysicsHandler.AccelerateAirborne(Client)
        PhysicsHandler.AlignToGravity(Client)

        if (Client.Ground.Grounded) {
            if (Client.Flags.IsBounce) {
                Client.Flags.JumpTimer = 0

                const Speed = 1 + (math.abs(Client.Speed.X) / 16)
                Client.Speed = Client.Speed.mul(new Vector3(1, 0, 1)).add(new Vector3(0, Speed * (Client.Flags.Bounces === 0 && 2.825 || 3.575)))

                Client.Flags.Bounces += 1

                Client.Flags.IsBounce = false
            } else {
                Client.State.Current = Client.State.States.Grounded
                Client.Land()
            }
        }
    }
}