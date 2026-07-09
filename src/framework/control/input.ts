import { Controller, type OnStart } from "@flamework/core";
import { atom } from "@rbxts/charm";
import Signal from "@rbxts/lemon-signal";
import { RunService, UserInputService } from "@rbxts/services";
import { Trash as Bin } from "@rbxts/trash";
import type { DataController } from "framework/data_controller";
import assets from "shared/assets";
import * as CFUtil from "shared/common/utility/cfutil";
import * as VUtil from "shared/common/utility/vutil";
import type { Client } from "..";
import { ButtonState } from "./buttonstate";

export const PlatformContextAtom = atom<"PC" | "Mobile" | "Gamepad">("PC");
type ButtonUnion = ExtractKeys<Input["Button"], ButtonState>;

/**
 * @class
 */
export class Input {
	public Button;
	public PlatformContext: "PC" | "Mobile" | "Gamepad" = PlatformContextAtom();
	public Stick;
	private Client: Client;
	private Connections = new Bin();

	constructor(Client: Client) {
		this.Client = Client;
		this.Button = {
			Jump: new ButtonState([Enum.KeyCode.Space, Enum.KeyCode.ButtonA], "Jump"),
			HomingAttack: new ButtonState([Enum.KeyCode.Space, Enum.KeyCode.ButtonA], "Homing Attack"),

			Boost: new ButtonState([Enum.KeyCode.LeftShift, Enum.KeyCode.ButtonX], "Boost", true),
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
				const Platform =
					Input.UserInputType === Enum.UserInputType.Keyboard || Input.UserInputType.Name.find("Mouse")[0]
						? "PC"
						: Input.UserInputType === Enum.UserInputType.Touch
							? "Mobile"
							: Input.UserInputType.Name.find("Gamepad")[0]
								? "Gamepad"
								: "PC";

				if (this.PlatformContext !== Platform) {
					PlatformContextAtom(Platform);
					this.PlatformContext = Platform;
				}
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
		if (UserInputService.GetFocusedTextBox()) return $tuple([], [], []);

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

							if (this.Client.Query ? this.Client.Query === this.Button[Key] : !this.Client.Flags.LockTimer || this.Button[Key].BypassLock) this.Button[Key].Update(true);
						}
					}
				});
			});
		});

		// Update unpressed keys
		for (const [Index, Button] of pairs(this.Button)) if (Button.IsDown && !KeyList.find((Object) => Object === Index)) Button.Update(false);

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

		if (this.Client.Query?.DidPress) {
			this.Client.QueryCallback?.();
			this.Client.Query = undefined;
			this.Client.QueryCallback = undefined;
		}
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

export namespace Nav {
	export const OnNavigateUp = new Signal();
	export const OnNavigateDown = new Signal();
	export const OnNavigateLeft = new Signal();
	export const OnNavigateRight = new Signal();

	export const OnNavigateSelect = new Signal();
	export const OnNavigateBack = new Signal();

	export const OnMoveLeft = new Signal();
	export const OnMoveRight = new Signal();

	export const OnPageLeft = new Signal();
	export const OnPageRight = new Signal();
}

@Controller()
// biome-ignore lint/correctness/noUnusedVariables: <controller>
class NavigationInputController implements OnStart {
	private ActiveDir: "Left" | "Right" | undefined = undefined;
	private HoldTime = 0;
	private StickCooldown = 0;
	private IsRepeating = false;

	constructor(private Data: DataController) {}

	public onStart() {
		UserInputService.InputBegan.Connect((Input, GPE) => {
			if (GPE) return;

			const Code = Input.KeyCode;

			if ([Enum.KeyCode.Up, Enum.KeyCode.DPadUp].includes(Code as never)) Nav.OnNavigateUp.Fire();
			if ([Enum.KeyCode.Down, Enum.KeyCode.DPadDown].includes(Code as never)) Nav.OnNavigateDown.Fire();
			if ([Enum.KeyCode.Space, Enum.KeyCode.ButtonA].includes(Code as never)) Nav.OnNavigateSelect.Fire();
			if ([Enum.KeyCode.LeftShift, Enum.KeyCode.ButtonB].includes(Code as never)) Nav.OnNavigateBack.Fire();
			if ([Enum.KeyCode.Q, Enum.KeyCode.ButtonL1].includes(Code as never)) Nav.OnPageLeft.Fire();
			if ([Enum.KeyCode.E, Enum.KeyCode.ButtonR1].includes(Code as never)) Nav.OnPageRight.Fire();

			if ([Enum.KeyCode.Left, Enum.KeyCode.DPadLeft].includes(Code as never)) this.SetActiveDirection("Left");
			if ([Enum.KeyCode.Right, Enum.KeyCode.DPadRight].includes(Code as never)) this.SetActiveDirection("Right");
		});

		UserInputService.InputEnded.Connect((Input) => {
			const Code = Input.KeyCode;
			if (this.ActiveDir === "Left" && [Enum.KeyCode.Left, Enum.KeyCode.DPadLeft].includes(Code as never)) this.ActiveDir = undefined;
			if (this.ActiveDir === "Right" && [Enum.KeyCode.Right, Enum.KeyCode.DPadRight].includes(Code as never)) this.ActiveDir = undefined;
		});

		RunService.Heartbeat.Connect((DeltaTime) => {
			this.MoveHold(DeltaTime);
			this.MoveStick(DeltaTime);
		});
	}

	private SetActiveDirection(Dir: "Left" | "Right") {
		this.ActiveDir = Dir;
		this.HoldTime = 0;
		this.IsRepeating = false;
		if (Dir === "Left") Nav.OnMoveLeft.Fire();
		else Nav.OnMoveRight.Fire();

		if (Dir === "Left") Nav.OnNavigateLeft.Fire();
		else Nav.OnNavigateRight.Fire();
	}

	private MoveHold(DeltaTime: number) {
		if (!this.ActiveDir) return;

		this.HoldTime += DeltaTime;
		const Threshold = this.IsRepeating ? 0.1 : 0.35;

		if (this.HoldTime >= Threshold) {
			this.HoldTime = 0;
			this.IsRepeating = true;
			if (this.ActiveDir === "Left") Nav.OnMoveLeft.Fire();
			else Nav.OnMoveRight.Fire();
		}
	}

	private MoveStick(DeltaTime: number) {
		if (this.ActiveDir || !this.Data.HasLoaded) return;

		const GamepadState = UserInputService.GetGamepadState(Enum.UserInputType.Gamepad1);
		const Thumbstick = GamepadState.find((Input) => Input.KeyCode === Enum.KeyCode.Thumbstick1);
		if (!Thumbstick?.Position) return;

		const XAxis = Thumbstick.Position.X;
		if (math.abs(XAxis) < this.Data.Data.Settings.Thumbstick1Deadzone) return;

		const AbsX = math.abs(XAxis);
		if (AbsX <= 0.2) return;

		this.StickCooldown -= DeltaTime;
		if (this.StickCooldown <= 0) {
			this.StickCooldown = math.lerp(0.2, 0.03, (AbsX - 0.2) / 0.8);
			if (XAxis < 0) Nav.OnMoveLeft.Fire();
			else Nav.OnMoveRight.Fire();
		}
	}
}
