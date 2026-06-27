import { UserInputService } from "@rbxts/services";
import { Trash as Bin } from "@rbxts/trash";
import assets from "shared/assets";
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
	public PlatformContext: "PC" | "Mobile" | "Gamepad";
	public Stick;
	private Client: Client;
	private Connections = new Bin();

	constructor(Client: Client) {
		this.Client = Client;
		this.Button = {
			Jump: new ButtonState([Enum.KeyCode.Space, Enum.KeyCode.ButtonA], "Jump"),
			HomingAttack: new ButtonState([Enum.KeyCode.Space, Enum.KeyCode.ButtonA], "Homing Attack"),

			Boost: new ButtonState([Enum.KeyCode.LeftShift, Enum.KeyCode.ButtonX], "Boost"),
			Bounce: new ButtonState([Enum.KeyCode.E, Enum.KeyCode.ButtonL2], "Bounce"),
			Stomp: new ButtonState([Enum.KeyCode.F, Enum.KeyCode.ButtonB], "Stomp"),
			Slide: new ButtonState([Enum.KeyCode.F, Enum.KeyCode.ButtonB], "Slide"),
			Debug: new ButtonState([Enum.KeyCode.One, Enum.KeyCode.DPadUp], "Debug"),

			RailSwitchLeft: new ButtonState([Enum.KeyCode.Q, Enum.KeyCode.ButtonL1], "Switch Left"),
			RailSwitchRight: new ButtonState([Enum.KeyCode.E, Enum.KeyCode.ButtonR1], "Switch Right"),
		};

		/* 
		platform context is purely for visual state (ex: button icons)
		it does not acutally affect inputs, those are gathered in bulk and combined so you can use any combination of any input type, including the camera.
		something roblox does not support with its default controlscripts
		*/
		this.PlatformContext = "PC";
		this.Stick = Vector2.zero;

		this.Connections.add(
			UserInputService.InputBegan.Connect((Input) => {
				if (Input.UserInputType === Enum.UserInputType.Keyboard) this.PlatformContext = "PC";
				else if (Input.UserInputType === Enum.UserInputType.Touch) this.PlatformContext = "Mobile";
				else if (Input.UserInputType === Enum.UserInputType.Gamepad1) this.PlatformContext = "Gamepad";
			}),
		);
	}

	public Destroy() {
		this.Connections.destroy();
	}

	/**
	 * Translates a KeyCode to a list of all binded `Input.Button`s
	 * @param Key KeyCode
	 * @returns List of all keys currently bound to `Key`
	 */
	public KeyCodeToButton(Key: Enum.KeyCode) {
		const List: ButtonUnion[] = [];
		for (const [Index, Button] of pairs(this.Button)) {
			const Target = Button.KeyCodes.find((Object) => Object === Key);
			if (Target) List.push(Index);
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

	public GetIconForButton(Button: ButtonState) {
		let PrimaryKeyCode: Enum.KeyCode | undefined = Button.KeyCodes.filter((Key) => {
			if (this.PlatformContext === "PC") return !Key.Name.find("Button")[0];
			else if (this.PlatformContext === "Gamepad") return !!Key.Name.find("Button")[0];
			else return false;
		})[0];

		if (!PrimaryKeyCode) return assets["key_icons/Unknown"];
		let KeyName = UserInputService.GetStringForKeyCode(PrimaryKeyCode);
		if (KeyName === "") KeyName = PrimaryKeyCode.Name;

		const ID = (assets as Record<string, string>)[`key_icons/${KeyName}`];

		return ID ? `${ID}` : assets["key_icons/Unknown"];
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
				if (Key.Position.Magnitude <= this.Client.Data.Data.Settings.Thumbstick1Deadzone) return;

				CStickX = Key.Position.X;
				CStickY = -Key.Position.Y;
			}
		});

		this.Stick = new Vector2(PCStickX + CStickX, PCStickY + CStickY);
		if (this.Stick.Magnitude > 0) this.Stick = this.Stick.Unit;

		// TODO: mobile stick
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
