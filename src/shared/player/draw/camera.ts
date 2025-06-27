import * as Render from "shared/common/utility/renderregistry"
import { Player } from ".."
import { Players, UserInputService, Workspace } from "@rbxts/services"

const MouseSensitivity = new Vector2(1, 0.77).mul(math.rad(0.5))
const PitchMax = 85

/**
 * @class
 */
export class Camera {
    private Player: Player
    public InputChanged: RBXScriptConnection
    public Zoom: number
    public Rotation: { X: number, Y: number, Z: number }
    public InputVector: Vector3

    constructor(Player: Player) {
        //Render.RegisterStepped("Camera", Enum.RenderPriority.Camera.Value + 1, (Delta:number) => this.Update(Delta))
        this.Rotation = { X: 0, Y: 0, Z: 0 }
        this.Zoom = 16
        this.Player = Player
        this.InputVector = Vector3.xAxis

        this.InputChanged = UserInputService.InputChanged.Connect((Input, Processed) => {
            if (Processed) { return }

            if (Input.UserInputType === Enum.UserInputType.MouseWheel) {
                this.Zoom = math.clamp(this.Zoom - (Input.Position.Z * 4), Players.LocalPlayer.CameraMinZoomDistance, Players.LocalPlayer.CameraMaxZoomDistance)
            }
        })
    }

    /**
     * Update `Camera`
     * @param Delta DeltaTime
     * @returns 
     */
    public Update(Delta: number) {
        if (!game.Workspace.CurrentCamera) { return }
        if (game.Workspace.CurrentCamera.CameraType === Enum.CameraType.Scriptable) { return }

        let JoyLeft = Vector3.zero; let JoyRight = Vector2.zero

        const GPState = UserInputService.GetGamepadState(Enum.UserInputType.Gamepad1)
        GPState.forEach((Value) => {
            if (Value.KeyCode === Enum.KeyCode.Thumbstick1) {
                JoyLeft = Value.Position
            } else if (Value.KeyCode === Enum.KeyCode.Thumbstick2) {
                JoyRight = new Vector2(Value.Position.X, Value.Position.Y)
            }
        })

        const RotatingCamera =
            (UserInputService.IsMouseButtonPressed(Enum.UserInputType.MouseButton2) && UserInputService.GetMouseDelta().Magnitude > 0)
            ||
            JoyRight.Magnitude > .15 //TODO: DEADZONE

        if (RotatingCamera) {
            let CamDelta = UserInputService.GetMouseDelta()
            if (JoyRight.Magnitude > .15) {
                const CamSens = UserSettings().GetService("UserGameSettings").MouseSensitivity

                //TODO: rough approx. see how playerscripts does it for gamepad later
                CamDelta = JoyRight.mul(new Vector2(1, -1)).mul(5).mul(CamSens) //TODO: customizable sensitivity
            }

            const YInvert = UserSettings().GetService("UserGameSettings").GetCameraYInvertValue()
            const Delta = CamDelta.mul(MouseSensitivity).mul(50)

            const PitchMod = -Delta.Y * YInvert
            const YawMod = -Delta.X

            this.Rotation.X = math.clamp(this.Rotation.X + math.rad(PitchMod), math.rad(-PitchMax), math.rad(PitchMax))
            this.Rotation.Y += math.rad(YawMod)
        }

        const Rotation = CFrame.Angles(0, this.Rotation.Y, 0).mul(CFrame.Angles(this.Rotation.X, 0, 0))

        // TODO: abstract & implement popper
        const FinalCFrame = new CFrame(this.Player.RenderCFrame.Position).mul(Rotation).add(new Vector3(0, this.Player.Character.FindFirstChildOfClass("Humanoid")?.HipHeight, 0)).add(Rotation.LookVector.mul(-this.Zoom))

        if (!Workspace.CurrentCamera) { return }
        Workspace.CurrentCamera.CFrame = FinalCFrame
        Workspace.CurrentCamera.Focus = FinalCFrame

        this.InputVector = FinalCFrame.LookVector
    }

    /**
     * Destroy `Camera`
     */
    public Destroy() {
        this.InputChanged.Disconnect()

        Render.UnregisterStepped("Camera")
    }
}