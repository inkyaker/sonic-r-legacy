import { Players, UserInputService, Workspace } from "@rbxts/services";
import type { Client } from "..";

const MouseSensitivity = new Vector2(1, 0.77).mul(math.rad(0.5));
const PitchMax = 85;

/**
 * @class
 */
export class Camera {
	private Client: Client;
	public InputChanged: RBXScriptConnection;
	public Zoom: number;
	public Rotation: { X: number; Y: number; Z: number };
	public InputVector: Vector3;
	public CenterPos: Vector3;
	private OffsetSpringPos: Vector3;
	private OffsetSpringVelocity: Vector3;

	constructor(Client: Client) {
		this.Rotation = { X: 0, Y: 0, Z: 0 };
		this.Zoom = 16;
		this.Client = Client;
		this.InputVector = Vector3.xAxis;
		this.CenterPos = Client.GetMiddle();

		this.OffsetSpringPos = Vector3.zero;
		this.OffsetSpringVelocity = Vector3.zero;

		this.InputChanged = UserInputService.InputChanged.Connect((Input, Processed) => {
			if (Processed) return;

			if (Input.UserInputType === Enum.UserInputType.MouseWheel)
				this.Zoom = math.clamp(this.Zoom - Input.Position.Z * 4, Players.LocalPlayer.CameraMinZoomDistance, Players.LocalPlayer.CameraMaxZoomDistance);
		});
	}

	/**
	 * Update `Camera`
	 * @param DeltaTime DeltaTime
	 * @returns
	 */
	public Update(DeltaTime: number) {
		if (!Workspace.CurrentCamera || Workspace.CurrentCamera.CameraType === Enum.CameraType.Scriptable) return;

		let JoyRight = Vector2.zero;

		const GPState = UserInputService.GetGamepadState(Enum.UserInputType.Gamepad1);
		GPState.forEach((Value) => {
			if (Value.KeyCode === Enum.KeyCode.Thumbstick2) JoyRight = new Vector2(Value.Position.X, Value.Position.Y);
		});

		const RotatingCamera = (UserInputService.IsMouseButtonPressed(Enum.UserInputType.MouseButton2) && UserInputService.GetMouseDelta().Magnitude > 0) || JoyRight.Magnitude > 0.15;

		if (RotatingCamera) {
			let CamDelta = UserInputService.GetMouseDelta();
			if (JoyRight.Magnitude > 0.15) {
				const CamSens = UserSettings().GetService("UserGameSettings").MouseSensitivity;
				CamDelta = JoyRight.mul(new Vector2(1, -1)).mul(5).mul(CamSens);
			}

			const YInvert = UserSettings().GetService("UserGameSettings").GetCameraYInvertValue();
			const Delta = CamDelta.mul(MouseSensitivity).mul(50);

			const PitchMod = -Delta.Y * YInvert;
			const YawMod = -Delta.X;

			this.Rotation.X = math.clamp(this.Rotation.X + math.rad(PitchMod), math.rad(-PitchMax), math.rad(PitchMax));
			this.Rotation.Y += math.rad(YawMod);
		}

		const RenderCFrame = this.Client.RenderCFrame;
		const BaseTargetCenter = RenderCFrame.Position.add(RenderCFrame.UpVector.mul(this.Client.Config.CameraOffset));
		const Speed = this.Client.ToGlobal(this.Client.Speed).mul(-0.5);
		const TargetOffset = Speed.LimitDistance(3);
		const Force = 2 / 0.15;
		const Force2 = Force * DeltaTime;
		const Exp = 1 / (1 + Force2 + 0.48 * Force2 ** 2 + 0.235 * Force2 ** 3);

		const Change = this.OffsetSpringPos.sub(TargetOffset);
		const Difference = this.OffsetSpringVelocity.add(Change.mul(Force)).mul(DeltaTime);

		this.OffsetSpringVelocity = this.OffsetSpringVelocity.sub(Difference.mul(Force)).mul(Exp);
		this.OffsetSpringPos = TargetOffset.add(Change.add(Difference).mul(Exp));
		this.CenterPos = BaseTargetCenter.add(this.OffsetSpringPos);

		const Rotation = CFrame.Angles(0, this.Rotation.Y, 0).mul(CFrame.Angles(this.Rotation.X, 0, 0));
		const FinalCFrame = Rotation.add(this.CenterPos).add(Rotation.LookVector.mul(-this.Zoom));

		Workspace.CurrentCamera.CFrame = FinalCFrame;
		Workspace.CurrentCamera.Focus = FinalCFrame;

		this.InputVector = FinalCFrame.LookVector;
	}

	/**
	 * Destroy `Camera`
	 */
	public Destroy() {
		this.InputChanged.Disconnect();
	}
}
