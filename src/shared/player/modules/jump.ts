import { Player } from "shared/player"

/**
 * Function ran in `State.CheckInput`
 * @move
 * @param Player 
 * @returns Move successful
 */
export function CheckJump(Player:Player) {
    if (Player.Input.Button.Jump.Pressed) {
        Player.State.Current = Player.State.Get("Airborne")
        Player.Speed = Player.Speed.add(new Vector3(0, Player.Physics.JumpInitalForce, 0))

        Player.Ground.Grounded = false
        Player.Flags.JumpTimer = Player.Physics.JumpTicks
        
        Player.EnterBall()
        Player.Animation.Current = "Roll"

        return true
    }
}