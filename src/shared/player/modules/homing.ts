import { Player } from "shared/player"

/**
 * Function ran in `State.CheckInput`
 * @move
 * @param Player 
 * @returns Move successful
 */
export function CheckHomingAttack(Player:Player) {
    if (Player.Input.Button.Jump.Pressed && Player.Flags.BallEnabled) {
        // TODO: homing attack
        Player.Speed = new Vector3(math.max(Player.Speed.X, Player.Physics.HomingForce.AirDash), Player.Speed.Y, Player.Speed.Z)

        Player.ExitBall()
        Player.Flags.TrailEnabled = true
        Player.Animation.Current = "Fall"

        return true
    }
}