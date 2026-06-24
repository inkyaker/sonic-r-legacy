import type { Client } from "framework";
import { workspace } from "shared/common/globals";
import { DecorateState, StateBase } from "./base_state";
import { StepBoost } from "./boost";
import { CheckJump } from "./jump";

/**
 * Rail component interface
 *
 * @playerComponent
 * @injects Client
 */
export class Rail {
	public Current: BasePart | undefined;
	public RailDirection: number = 1;
	public RailOffset: Vector3 = Vector3.zero;
	public RailTrick: number = 0;
	public RailSound: Sound | undefined;
	public RailGrace: number = 0;
	public RailBonusTime: number = 0;
	public RailDebounce: number = 0;

	public Connections: RBXScriptConnection[] = [];
}

export function RailActive(Client: Client) {
	return Client.State.Current === Client.State.States.Rail && Client.Rail.RailOffset.Magnitude < 0.5;
}

export function GetRailPosition(Client: Client) {
	assert(Client.Rail.Current, "GetRailPosition() called without Client.Rail.Current being set, did you mean to call this function?");
	const Offset = Client.Rail.Current.CFrame.Inverse().mul(Client.Position);

	return Client.Rail.Current.CFrame.mul(new Vector3(0, Client.Rail.Current.Size.Y / 2, Offset.Z));
}

export function GetRailAngle(Client: Client) {
	if (Client.Rail.Current) {
		let Angle: number;
		if (Client.Rail.RailDirection >= 0) {
			Angle = 0;
		} else {
			Angle = math.pi;
		}
		return Client.Rail.Current.CFrame.Rotation.mul(CFrame.Angles(0, Angle, 0));
	}
	return Client.Angle;
}

export function SetRail(Client: Client, Part?: Part) {
	const Rail = Client.Rail;

	if (Part) {
		const Direction = Client.Angle.LookVector.Dot(Part.CFrame.LookVector);
		const Speed = Client.ToGlobal(Client.Speed).Dot(Part.CFrame.LookVector);
		let RailDirection: number;

		if (Direction !== 0) {
			RailDirection = math.sign(Direction);
		} else if (Speed !== 0) {
			RailDirection = math.sign(Speed);
		} else {
			RailDirection = 1;
		}

		if (!Rail.Current) {
			Client.ResetObjectState();
			Client.Land();
			Client.State.Current = Client.State.States.Rail;

			Rail.Current = Part;
			Rail.RailDirection = RailDirection;
			Rail.RailOffset = Vector3.zero;
			Rail.RailTrick = 0;
			Rail.RailSound = undefined;
			Rail.RailGrace = 0;
			Rail.RailBonusTime = 0;

			const PreviousSpeed = Client.ToGlobal(Client.Speed);
			Client.Angle = GetRailAngle(Client);
			Client.Speed = new Vector3(Client.ToLocal(PreviousSpeed).X, 0, 0);
			Client.Animation.Current = "Rail";

			Client.Position = GetRailPosition(Client);
		} else if (Rail.Current !== Part) {
			Rail.Current = Part;
			Rail.RailDirection = RailDirection;

			Client.Angle = GetRailAngle(Client);
			Client.Position = GetRailPosition(Client);
		} else {
			return;
		}
	} else if (Client.Rail.Current !== undefined) {
		Rail.Current = undefined;
		Rail.RailDebounce = 25;
		Rail.RailOffset = Vector3.zero;
	}
}

/**
 *
 * @move
 */
export function CheckRail(Client: Client) {
	if (Client.Rail.RailDebounce > 0 || Client.Rail.Current) return false;

	const Rail = Client.State.States.Rail;
	const LastPosition = Client.LastCFrame.Position;

	if (LastPosition.Distance(Client.Position) >= .0001) {
		const Look = CFrame.lookAt(LastPosition, Client.Position).LookVector;
		const Magnitude = LastPosition.Distance(Client.Position);

		const Cast = workspace.Spherecast(LastPosition.sub(Look.mul(Rail.Skin)), Rail.Skin, Look.mul(Magnitude + Rail.Skin), Rail.Params);
		if (Cast) {
			SetRail(Client, Cast.Instance as Part);
		}
	}

	return Client.State.Current === Client.State.States.Rail;
}

/**
 * @class
 * @state
 * @augments StateBase
 */
@DecorateState()
export class StateRail extends StateBase {
	public Params: RaycastParams;
	public Skin: number = 3;

	constructor() {
		super();

		this.Params = new RaycastParams();
		this.Params.FilterDescendantsInstances = [workspace.Level.Rails];
		this.Params.FilterType = Enum.RaycastFilterType.Include;
	}

	protected CheckInput(Client: Client) {
		if (CheckJump(Client)) {
			SetRail(Client);

			return true;
		}
	}

	protected BeforeUpdateHook(Client: Client) {
		const Rail = Client.Rail;

		//Immediately quit if not on a rail
		if (!Rail.Current) {
			return;
		}

		//Gravity
		const Weight = Client.GetWeight();
		// TODO: Water detection

		let Gravity = Client.ToLocal(Client.Flags.Gravity).mul(Weight).X;

		//Amplify gravity
		if (math.sign(Gravity) === math.sign(Client.Speed.X)) {
			//Have stronger gravity when gravity is working with us
			Gravity *= 1.125 + math.abs(Client.Speed.X) / 8;
		} else {
			//Have weaker gravity when gravity is working against us
			Gravity *= (0.5 / (1 + math.abs(Client.Speed.X) / 3.5));
		}

		//Get drag factor
		let Drag = 0.95;

		//Apply gravity and drag
		Client.Speed = Client.Speed.add(new Vector3(Gravity, 0, 0));
		Client.Speed = Client.Speed.add(new Vector3(Client.Speed.X * Client.Config.AirResist.X * 0.715 * Drag, 0, 0));

		//Make sure player is at a minimum speed
		if (Client.Speed.X === 0) {
			Client.Speed = new Vector3(Client.Config.JogSpeed, Client.Speed.Y, Client.Speed.Z);
		} else if (math.abs(Client.Ground.DotProduct) > 0.95) {
			Client.Speed = new Vector3(math.max(math.abs(Client.Speed.X), Client.Config.JogSpeed) * math.sign(Client.Speed.X), Client.Speed.Y, Client.Speed.Z);
		}

		//Give rail bonus at high speed
		if (math.abs(Client.Speed.X) >= 8) {
			Rail.RailBonusTime++;
			if (Rail.RailBonusTime >= 60) {
				Client.GameState.AddScore((Client.Speed.X < 0 && 1000) || 700);
				Rail.RailBonusTime = 0;
			}
		} else {
			Rail.RailBonusTime = math.max(Rail.RailBonusTime - 2, 0);
		}
	}

	protected AfterUpdateHook(Client: Client) {
		const Rail = Client.Rail;
		if (!Rail.Current) {
			SetRail(Client);
			Client.State.Current = Client.State.States.Airborne;

			return;
		}

		Rail.RailOffset = Rail.RailOffset.mul(0.8);

		//Run sound
		const Active = RailActive(Client);
		if (Active) {
			if (!Rail.RailSound) {
				Client.Sound.Play("Character/GrindContact");
				Rail.RailSound = Client.Sound.Play("Character/Grind", { BoundState: "StateRail" });
			}

			if (Rail.RailSound) Rail.RailSound.Volume = math.sqrt(math.abs(Client.Speed.X) / 8);
		}

		//Set animation
		if (RailActive(Client)) {
			Client.Animation.Current = "Rail";
			Client.Animation.Speed = Client.Speed.X;
		} else {
			const LocalOffset = Client.Angle.Inverse().mul(Rail.RailOffset);

			Client.Animation.Current = (LocalOffset.X === 0 && Client.Animation.Current) || `RailSwitch${(LocalOffset.X < 0 && "Left") || "Right"}`;
		}

		StepBoost(Client);

		if (Rail.RailGrace > 0) {
			Rail.RailGrace--;

			if (Rail.RailGrace <= 0) {
				SetRail(Client);

				return;
			}
		} else {
			while (true) {
				Client.Position = GetRailPosition(Client);
				Client.Angle = GetRailAngle(Client);

				const Direction = Rail.RailDirection * math.sign(Client.Speed.X);
				const Offset = Rail.Current.CFrame.Inverse().mul(Client.Position);
				if (Client.Speed.X !== 0 && Offset.Z * -Direction > Rail.Current.Size.Z / 2) {
					const Cast = workspace.Raycast(Rail.Current.Position, Rail.Current.CFrame.LookVector.mul(Rail.Current.Size.Z / 2 + 1).mul(Direction), this.Params);
					if (Cast) {
						SetRail(Client, Cast.Instance as Part);
					} else {
						Rail.RailGrace = 1 + math.floor(math.abs(Client.Speed.X) / 3.5);
						break;
					}
				} else {
					break;
				}
			}
		}

		if (!Client.Rail.Current && Client.State.Current === Client.State.States.Rail) {
			Client.State.Current = Client.State.States.Airborne;
		}
	}

	protected OnStep(Client: Client) {
		if (Client.Rail.RailDebounce > 0) {
			Client.Rail.RailDebounce--;
		}
	}
}
