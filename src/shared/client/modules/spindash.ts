import { Client } from "shared/client"
import { PhysicsHandler } from "shared/client/physics/physics"
import { State } from "./state"
import { CheckJump } from "./jump"

/**
 * Function ran in `State.CheckInput`
 * @move
 * @param Client 
 * @returns Move successful
 */
export function CheckSpindash(Client: Client) {
    if (Client.Input.Button.Spindash.Pressed) {
        Client.State.Current = Client.State.Get("Spindash")
        Client.Flags.SpindashSpeed = math.max(Client.Speed.X, 2)
        Client.EnterBall()

        return true
    }
}

/**
 * @class
 * @state
 * @augments State
 */
export class StateSpindash extends State {
    constructor() {
        super()
    }

    protected CheckInput(Client: Client) {
        if (Client.Input.Button.Spindash.Activated) {
            if (Client.Flags.SpindashSpeed < 10) {
                Client.Flags.SpindashSpeed += .4
            }
        } else {
            // Release
            Client.Speed = Client.Speed.mul(new Vector3(0, 1, 1)).add(new Vector3(Client.Flags.SpindashSpeed, 0, 0))
            Client.EnterBall()
            Client.State.Current = Client.State.Get("Roll")
        }
    }

    protected AfterUpdateHook(Client: Client) {
        PhysicsHandler.ApplyGravity(Client)
        PhysicsHandler.Turn(Client, Client.Input.GetTurn(), undefined)
        PhysicsHandler.Skid(Client)
        //PhysicsHandler.AccelerateGrounded(Client)

        if (Client.Ground.Grounded) {
            Client.Animation.Current = "Spindash"
        } else {
            Client.Animation.Current = "Roll"
            Client.State.Current = Client.State.Get("Airborne")
        }
    }
}

/**
 * @class
 * @state
 * @augments State
 */
export class StateRoll extends State {
    constructor() {
        super()
    }

    protected CheckInput(Client: Client) {
        if (Client.Input.Button.Roll.Pressed || Client.Speed.X < Client.Physics.RollGetup) {
            // TODO: ceil clip
            Client.State.Current = Client.State.Get("Grounded")
            Client.ExitBall()

            return true
        }

        return CheckJump(Client)
    }

    protected AfterUpdateHook(Client: Client) {
        PhysicsHandler.RollInertia(Client)
        PhysicsHandler.Turn(Client, Client.Input.GetTurn(), undefined)

        if (Client.Ground.Grounded) {
            Client.Animation.Current = "Roll"
        } else {
            Client.State.Current = Client.State.Get("Airborne")
        }
    }
}