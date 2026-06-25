import { UserInputService, Workspace } from "@rbxts/services";
import { CollisionParams } from "framework/physics/collision";
import type { Client } from "..";

const MouseSensitivity = new Vector2(1, 0.77).mul(math.rad(0.5));
const StickSensitivity = new Vector2(1, 0.77).mul(math.rad(4) * 60);
const TouchSensitivity = new Vector2(1, 0.66).mul(math.rad(1));
const PitchMax = math.rad(80);

function ThumbstickCurve(X: number) {
	const FDeadzone = (math.abs(X) - 0.1) / (1 - 0.1);
	if (FDeadzone <= 0) return 0;

	const FCurve = (math.exp(2 * FDeadzone) - 1) / (math.exp(2) - 1);
	return math.sign(X) * math.clamp(FCurve, 0, 1);
}

function AdjustTouchPitchSensitivity(Delta: Vector2, Pitch: number) {
	if (Delta.Y * Pitch >= 0) return Delta;

	const CurveY = 1 - ((2 * math.abs(Pitch)) / math.pi) ** 0.75;
	const Sens = CurveY * (1 - 0.25) + 0.25;

	return new Vector2(Delta.X, Delta.Y * Sens);
}

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

	public MouseDelta = Vector2.zero;
	public TouchDelta = Vector2.zero;

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

			if (Input.UserInputType === Enum.UserInputType.MouseMovement) {
				if (UserInputService.IsMouseButtonPressed(Enum.UserInputType.MouseButton2)) {
					this.MouseDelta = this.MouseDelta.add(new Vector2(Input.Delta.X, Input.Delta.Y));
				}
			} else if (Input.UserInputType === Enum.UserInputType.Touch) {
				this.TouchDelta = this.TouchDelta.add(new Vector2(Input.Delta.X, Input.Delta.Y));
			}
		});
	}

	/**
	 * Update Camera
	 * @param DeltaTime DeltaTime
	 * @returns
	 */
	public Update(DeltaTime: number) {
		if (!Workspace.CurrentCamera || Workspace.CurrentCamera.CameraType === Enum.CameraType.Scriptable) return;

		let GamepadInput = Vector2.zero;
		const GPState = UserInputService.GetGamepadState(Enum.UserInputType.Gamepad1);

		for (const Value of GPState) if (Value.KeyCode === Enum.KeyCode.Thumbstick2) GamepadInput = new Vector2(ThumbstickCurve(Value.Position.X), -ThumbstickCurve(Value.Position.Y));

		const CamSens = UserSettings().GetService("UserGameSettings").GamepadCameraSensitivity;
		const YInvert = UserSettings().GetService("UserGameSettings").GetCameraYInvertValue();
		const InvertVector = new Vector2(1, YInvert);

		const DeltaGamepad = GamepadInput.mul(StickSensitivity).mul(CamSens).mul(DeltaTime);
		const DeltaMouse = this.MouseDelta.mul(MouseSensitivity);
		const DeltaTouch = AdjustTouchPitchSensitivity(this.TouchDelta, this.Rotation.X).mul(TouchSensitivity);

		const TotalDelta = DeltaGamepad.add(DeltaMouse).add(DeltaTouch).mul(InvertVector);

		this.MouseDelta = Vector2.zero;
		this.TouchDelta = Vector2.zero;

		if (TotalDelta.Magnitude > 0) {
			this.Rotation.X = math.clamp(this.Rotation.X - TotalDelta.Y, -PitchMax, PitchMax);
			this.Rotation.Y -= TotalDelta.X;
		}

		const RenderCFrame = this.Client.RenderCFrame;
		const BaseTargetCenter = RenderCFrame.Position.add(RenderCFrame.UpVector.mul(this.Client.Config.CameraOffset));
		const Speed = this.Client.ToGlobal(this.Client.Speed).mul(-0.5);
		const TargetOffset = Speed.LimitDistance(3);
		const Force = 2 / 0.15;
		const DeltaForce = Force * DeltaTime;
		const Exponent = 1 / (1 + DeltaForce + 0.48 * DeltaForce ** 2 + 0.235 * DeltaForce ** 3);

		const Change = this.OffsetSpringPos.sub(TargetOffset);
		const Difference = this.OffsetSpringVelocity.add(Change.mul(Force)).mul(DeltaTime);

		this.OffsetSpringVelocity = this.OffsetSpringVelocity.sub(Difference.mul(Force)).mul(Exponent);
		this.OffsetSpringPos = TargetOffset.add(Change.add(Difference).mul(Exponent));
		this.CenterPos = BaseTargetCenter.add(this.OffsetSpringPos);

		const Rotation = CFrame.Angles(0, this.Rotation.Y, 0).mul(CFrame.Angles(this.Rotation.X, 0, 0));
		let FinalCFrame = Rotation.add(this.CenterPos).add(Rotation.LookVector.mul(-this.Zoom));

		const Cast = Workspace.Raycast(this.CenterPos, FinalCFrame.Position.sub(this.CenterPos), CollisionParams);
		if (Cast) FinalCFrame = FinalCFrame.Rotation.add(Cast.Position).add(Cast.Normal.mul(0.1));

		Workspace.CurrentCamera.CFrame = FinalCFrame;
		Workspace.CurrentCamera.Focus = FinalCFrame;

		this.InputVector = FinalCFrame.LookVector;
	}

	/**
	 * Destroy Camera
	 */
	public Destroy() {
		this.InputChanged.Disconnect();
	}
}
