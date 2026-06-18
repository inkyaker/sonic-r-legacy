import { UserInputService } from "@rbxts/services";
import * as CFUtil from "shared/common/utility/cfutil";
import * as VUtil from "shared/common/utility/vutil";
import type { Client } from "..";
import { ButtonState } from "./buttonstate";

type ButtonUnion = ExtractKeys<Input["Button"], ButtonState>;

/**
 * @class
 */
export class Input {
	public Button;
	public PlatformContext: string;
	public ControllerContext: String;
	public Stick;
	private Client: Client;

	constructor(Client: Client) {
		this.Client = Client;
		this.Button = {
			Jump: new ButtonState([Enum.KeyCode.Space, Enum.KeyCode.ButtonA]),
			Boost: new ButtonState([Enum.KeyCode.LeftShift, Enum.KeyCode.ButtonX]),
			Roll: new ButtonState([Enum.KeyCode.E, Enum.KeyCode.ButtonR2]),
			Bounce: new ButtonState([Enum.KeyCode.E, Enum.KeyCode.ButtonL2]),
			Stomp: new ButtonState([Enum.KeyCode.F, Enum.KeyCode.ButtonB]),
			Slide: new ButtonState([Enum.KeyCode.F, Enum.KeyCode.ButtonB]),
			Debug: new ButtonState([Enum.KeyCode.One, Enum.KeyCode.DPadUp]),
		};

		this.PlatformContext = "PC"; // assume pc by default
		this.ControllerContext = "Xbox";
		this.Stick = Vector2.zero;
	}

	/**
	 * Translates a KeyCode to a list of all binded `Input.Button`s
	 * @param Key KeyCode
	 * @returns List of all keys currently
	 */
	public KeyCodeToButton(Key: Enum.KeyCode) {
		const List: ButtonUnion[] = [];
		for (const [Index, Button] of pairs(this.Button)) {
			const Target = Button.KeyCodes.find((Object) => Object === Key);
			if (Target) {
				List.push(Index);
			}
		}

		return List;
	}

	public GetInputState() {
		if (this.Client.Flags.LockTimer > 0) return $tuple([], [], []);

		const KeyboardState = UserInputService.GetKeysPressed();
		const ControllerState = UserInputService.GetGamepadState(Enum.UserInputType.Gamepad1);
		const MobileState: InputObject[] = []; // TODO: automatically create mobile buttons and match them to keycodes

		return $tuple(KeyboardState, ControllerState, MobileState);
	}

	/**
	 * Update input
	 */
	public Update() {
		const [KeyboardState, ControllerState, MobileState] = this.GetInputState();

		let KeyList: string[] = [];
		const TotalState = [KeyboardState, ControllerState, MobileState];
		TotalState.forEach((DeviceState) => {
			DeviceState.forEach((Object) => {
				if (Object.KeyCode === Enum.KeyCode.Unknown || Object.UserInputState !== Enum.UserInputState.Begin) {
					return;
				}
				const List = this.KeyCodeToButton(Object.KeyCode);
				List.forEach((Key) => {
					if (Key) {
						if (!KeyList.find((Object) => Object === Key)) {
							KeyList.push(Key);

							this.Button[Key].Update(true);
						}
					}
				});
			});
		});

		// Update unpressed keys
		for (const [Index, Button] of pairs(this.Button)) {
			if (Button.IsDown && !KeyList.find((Object) => Object === Index)) {
				Button.Update(false);
			}
		}

		// Stick
		let PCStickX = 0;
		let PCStickY = 0;
		let CStickX = 0;
		let CStickY = 0;

		PCStickX += (UserInputService.IsKeyDown(Enum.KeyCode.A) && -1) || 0;
		PCStickX += (UserInputService.IsKeyDown(Enum.KeyCode.D) && 1) || 0;
		PCStickY -= (UserInputService.IsKeyDown(Enum.KeyCode.W) && 1) || 0;
		PCStickY -= (UserInputService.IsKeyDown(Enum.KeyCode.S) && -1) || 0;

		ControllerState.forEach((Key) => {
			if (Key.KeyCode === Enum.KeyCode.Thumbstick1) {
				if (Key.Position.Magnitude <= 0.15) {
					return;
				} // TODO: customizable deadzone

				CStickX = Key.Position.X;
				CStickY = -Key.Position.Y;
			}
		});

		this.Stick = new Vector2(PCStickX + CStickX, PCStickY + CStickY);
		if (this.Stick.Magnitude > 0) {
			this.Stick = this.Stick.Unit;
		}

		// TODO: mobile stick

		// TODO: Update platform & controller context
	}

	public PrepareReset() {
		for (const [_, Key] of pairs(this.Button)) {
			Key.CanBeUpdated = true;
		}
	}

	public InputLocked() {
		return this.Client.Flags.DirectVelocity && this.Client.Flags.LockTimer > 0;
	}

	/**
	 * Convert input angle to turn value
	 * @returns Current turn value
	 */
	public GetTurn() {
		if (this.Client.Flags.LockTimer > 0 || !game.Workspace.CurrentCamera || this.Stick.Magnitude === 0) return 0;

		const CameraUp = Vector3.yAxis;
		const Look = this.Client.Angle.LookVector;
		const Up = this.Client.Angle.UpVector;

		let [CameraLook] = VUtil.PlaneProject(game.Workspace.CurrentCamera.CFrame.LookVector, CameraUp);
		if (CameraLook.Magnitude !== 0) CameraLook = CameraLook.Unit;
		else CameraLook = Look;
		
		const CameraTarget = CFrame.fromAxisAngle(CameraUp, math.atan2(-this.Client.Input.Stick.X, -this.Client.Input.Stick.Y)).mul(CameraLook);
		if (CameraUp.Dot(Up) >= -0.999) this.Client.Flags.LastUp = Up;

		const FinalRotation = CFUtil.FromToRotation(CameraUp, this.Client.Flags.LastUp);

		let [TurnUnsigned] = VUtil.PlaneProject(FinalRotation.mul(CameraTarget), Up);
		TurnUnsigned = TurnUnsigned.Magnitude === 0 ? Look : TurnUnsigned.Unit;

		const Turn = VUtil.SignedAngle(Look, TurnUnsigned, Up);
		return Turn;
	}

	/**
	 * Get all input information
	 * @returns Tuple: {HasControl, ClientTurn, StickMagnitude}
	 */
	public Get() {
		return $tuple(!this.InputLocked() && this.Stick.Magnitude !== 0, this.GetTurn(), this.Stick.Magnitude);
	}
}
