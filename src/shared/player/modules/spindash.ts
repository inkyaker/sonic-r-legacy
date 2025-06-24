import { Player } from "shared/player"
import { PhysicsHandler } from "shared/player/physics/physics"
import { StateBase } from "./base"
import { CheckJump } from "./jump"

/**
 * Function ran in `State.CheckInput`
 * @move
 * @param Player 
 * @returns Move successful
 */
export function CheckSpindash(Player:Player) {
    if (Player.Input.Button.Spindash.Pressed) {
        Player.State.Current = Player.State.Get("Spindash")
        Player.Flags.SpindashSpeed = math.max(Player.Speed.X, 2)
        Player.EnterBall()

        return true
    }
}

/**
 * @class
 * @state
 * @augments StateBase
 */
export class StateSpindash extends StateBase {
    constructor() {
        super()
    }

    protected CheckInput(Player:Player) {
        if (Player.Input.Button.Spindash.Activated) {
            if (Player.Flags.SpindashSpeed < 10) {
                Player.Flags.SpindashSpeed += .4
            }
        } else {
            // Release
            Player.Speed = Player.Speed.mul(new Vector3(0, 1, 1)).add(new Vector3(Player.Flags.SpindashSpeed, 0, 0))
            Player.EnterBall()
            Player.State.Current = Player.State.Get("Roll")
        }
    }

    protected AfterUpdateHook(Player:Player) {
        PhysicsHandler.ApplyGravity(Player) 
        PhysicsHandler.Turn(Player, Player.Input.GetTurn(Player), undefined)
        PhysicsHandler.Skid(Player)
        //PhysicsHandler.AccelerateGrounded(Player)

        if (Player.Ground.Grounded) {
            Player.Animation.Current = "Spindash"
        } else {
            Player.Animation.Current = "Roll"
            Player.State.Current = Player.State.Get("Airborne")
        }
    }
}

/**
 * @class
 * @state
 * @augments StateBase
 */
export class StateRoll extends StateBase {
    constructor() {
        super()
    }

    protected CheckInput(Player:Player) {
        if (Player.Input.Button.Roll.Pressed || Player.Speed.X < Player.Physics.RollGetup) {
            // TODO: ceil clip
            Player.State.Current = Player.State.Get("Grounded")
            Player.ExitBall()

            return true
        }

        return CheckJump(Player)
    }

    protected AfterUpdateHook(Player:Player) {
        PhysicsHandler.RollInertia(Player)
        PhysicsHandler.Turn(Player, Player.Input.GetTurn(Player), undefined)

        if (Player.Ground.Grounded) {
            Player.Animation.Current = "Roll"
        } else {
            Player.State.Current = Player.State.Get("Airborne")
        }
    }
}