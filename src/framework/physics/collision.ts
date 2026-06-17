import { Constants } from "shared/common/constants";
import { Workspace } from "shared/common/globals";
import * as CFUtil from "shared/common/utility/cfutil";
import * as VUtil from "shared/common/utility/vutil";
import type { Client } from "..";

export const CollisionParams = new RaycastParams();
CollisionParams.FilterType = Enum.RaycastFilterType.Include;

// TODO: redo this might not be needed
task.spawn(() => {
	if (!game.IsLoaded()) game.Loaded.Wait();

	CollisionParams.AddToFilter(Workspace.Level.Map.Collision);
});

function GetAligned(Client: Client, Normal: Vector3) {
	if (Client.Angle.UpVector.Dot(Normal) < -0.999) {
		return CFrame.Angles(math.pi, 0, 0).mul(Client.Angle);
	}
	const Diff = CFUtil.FromToRotation(Client.Angle.UpVector, Normal);
	return Diff.mul(Client.Angle);
}

function AlignNormal(Client: Client, Normal: Vector3) {
	Client.Angle = GetAligned(Client, Normal);
}

//Velocity cancel for walls
function VelCancel(Velocity: Vector3, Normal: Vector3) {
	const Dot = Velocity.Dot(Normal.Unit);
	if (Dot < 0) {
		return Velocity.sub(Normal.Unit.mul(Dot));
	}
	return Velocity;
}

function LocalVelCancel(Client: Client, vel: Vector3, normal: Vector3) {
	return Client.ToLocal(VelCancel(Client.ToGlobal(vel), normal.Unit));
}

function _LocalFlatten(Client: Client, vector: Vector3, normal: Vector3) {
	return Client.ToLocal(VUtil.Flatten(Client.ToGlobal(vector), normal.Unit));
}

function Raycast(From: Vector3, Direction: Vector3) {
	const Result = game.Workspace.Raycast(From, Direction, CollisionParams);
	if (Result) {
		return $tuple(Result.Instance, Result.Position, Result.Normal, Result.Material);
	} else {
		return $tuple(undefined, From.add(Direction), undefined, Enum.Material.Air);
	}
}

//Wall collision
function WallRay(Client: Client, Y: number, Direction: Vector3, Velocity: number) {
	//Raycast
	const ReverseDirection = Direction.mul(Client.Config.Radius * Client.Config.Scale);
	const From = Client.Position.add(Client.Angle.UpVector.mul(Y));
	const ForwardDirection = Direction.mul((Client.Config.Radius + Velocity) * Client.Config.Scale);

	const [Hit, Position, Normal] = Raycast(From, ForwardDirection);

	if (Hit) {
		return $tuple(Position?.sub(ReverseDirection)?.sub(From), Normal, Position);
	}

	return $tuple(undefined, undefined, undefined);
}

function CheckWallAttach(Client: Client, Direction: Vector3, Normal: Vector3) {
	const DirectionDot = Direction.Dot(Normal);
	const SpeedDot = Client.ToGlobal(Client.Speed).Dot(Normal);
	const UpDot = Client.Angle.UpVector.Dot(Normal);
	return DirectionDot < -0.35 && SpeedDot < -1.16 && UpDot > 0.5;
}

function WallAttach(Client: Client, InputNormal: Vector3) {
	const FUp = Client.Config.Height * Client.Config.Scale;
	const FDown = FUp + Client.Config.PositionError * Client.Config.Scale;
	const [Hit, Position, Normal] = Raycast(Client.Position.add(Client.Angle.UpVector.mul(FUp)), InputNormal.mul(-FDown));

	if (Hit && Position) {
		Client.Position = Position;
		Client.Angle = GetAligned(Client, Normal);
	}
}

function WallHit(Client: Client, Normal: Vector3) {
	Client.Speed = LocalVelCancel(Client, Client.Speed, Normal);
}

function WallCollide(Client: Client, Y: number, Direction: Vector3, Velocity: number, ForwardAttach: boolean, BackAttach: boolean) {
	//Positive and negative wall collision
	let [ForwardPos, ForwardNormal] = WallRay(Client, Y, Direction, math.max(Velocity, 0));
	let [BackwardPos, BackwardNormal] = WallRay(Client, Y, Direction.mul(-1), math.max(-Velocity, 0));

	//Clip with walls
	let ShouldMove = true;
	if (ForwardPos && BackwardPos && ForwardNormal && BackwardNormal) {
		Client.Position = Client.Position.add(ForwardPos.add(BackwardPos).div(2));
		const Middle = ForwardNormal.add(BackwardNormal);
		if (Middle.Magnitude !== 0) {
			ForwardNormal = Middle.Unit;
		} else {
			ForwardNormal = undefined;
		}
		BackwardNormal = undefined;
		ShouldMove = false;
	} else if (ForwardPos) {
		Client.Position = Client.Position.add(ForwardPos);
	} else if (BackwardPos) {
		Client.Position = Client.Position.add(BackwardPos);
	}

	//Velocity cancelling
	if (ForwardNormal) {
		if (ForwardAttach && CheckWallAttach(Client, Direction, ForwardNormal)) {
			WallAttach(Client, ForwardNormal);
			ShouldMove = false;
		} else {
			WallHit(Client, ForwardNormal);
		}
	}
	if (BackwardNormal) {
		if (BackAttach && CheckWallAttach(Client, Direction.mul(-1), BackwardNormal)) {
			WallAttach(Client, BackwardNormal);
			ShouldMove = false;
		} else {
			WallHit(Client, BackwardNormal);
		}
	}
	return ShouldMove;
}

/**
 * Run global collision for `Client`
 * @param Client
 */
export function RunCollision(Client: Client) {
	//Stick to moving floors
	if (Client.Ground.Grounded && Client.Ground.Floor && Client.Ground.FloorLast && Client.Ground.FloorOffset) {
		const PreviousWorld = Client.Ground.FloorLast.mul(Client.Ground.FloorOffset);
		const NewWorld = Client.Ground.Floor.CFrame.mul(Client.Ground.FloorOffset);
		const RightDiff = CFUtil.FromToRotation(PreviousWorld.RightVector, NewWorld.RightVector);

		Client.Ground.FloorSpeed = NewWorld.Position.sub(PreviousWorld.Position);
		Client.Position = Client.Position.add(Client.Ground.FloorSpeed);
		Client.Angle = RightDiff.mul(Client.Angle);
	}

	for (const _ of $range(1, 4)) {
		//Remember previous position
		const PreviousMiddle = Client.GetMiddle();

		//Wall collision heights
		const HeightScale = Client.State.Current.GetID() === "StateSlide" ? 0.3 : 1;
		const Heights = [
			Client.Config.Height * 0.85 * Client.Config.Scale * HeightScale,
			Client.Config.Height * 1.25 * Client.Config.Scale * HeightScale,
			Client.Config.Height * 1.95 * Client.Config.Scale * HeightScale,
		];

		//Wall collision and horizontal movement
		{
			let XMove = true;
			let ZMove = true;
			for (const [i, v] of pairs(Heights)) {
				if (WallCollide(Client, v, Client.Angle.LookVector, Client.Speed.X, (Client.Ground.Grounded || Client.Speed.Y <= 0) && i === 1, false) === false) {
					XMove = false;
				}
				if (WallCollide(Client, v, Client.Angle.RightVector, Client.Speed.Z, false, false) === false) {
					ZMove = false;
				}
			}

			if (XMove) Client.Position = Client.Position.add(Client.Angle.LookVector.mul(Client.Speed.X * Client.Config.Scale));
			if (ZMove) Client.Position = Client.Position.add(Client.Angle.RightVector.mul(Client.Speed.Z * Client.Config.Scale));
		}

		//Ceiling collision
		{
			let CeilUp = Client.Config.Height * Client.Config.Scale;
			let CeilDown = CeilUp;

			if (Client.Speed.Y > 0) {
				CeilDown += Client.Speed.Y * Client.Config.Scale; //Moving upwards, extend raycast upwards
			} else if (Client.Speed.Y < 0) {
				CeilUp += Client.Speed.Y * Client.Config.Scale; //Moving downwards, move raycast downwards
			}

			const From = Client.Position.add(Client.Angle.UpVector.mul(CeilUp));
			const Direction = Client.Angle.UpVector.mul(CeilDown);
			const [Hit, Position, Normal] = Raycast(From, Direction);

			if (Hit && Position && Normal) {
				if (Client.Ground.Grounded) {
					//Set ceiling clip flag
					//Client.flag.ceiling_clip = nor:Dot(Client.gravity.Unit) > 0.9 // TODO: ceil clip
				} else {
					//Clip and cancel velocity
					Client.Position = Position.sub(Client.Angle.UpVector.mul(Client.Config.Height * 2 * Client.Config.Scale));
					Client.Speed = LocalVelCancel(Client, Client.Speed, Normal);
					//Client.flag.ceiling_clip = false
				}
			}
		}

		//Floor collision
		{
			let PositionError = (Client.Ground.Grounded && Client.Config.PositionError * Client.Config.Scale) || 0;
			let FloorUp = Client.Config.Height * Client.Config.Scale;
			let FloorDown = -(FloorUp + PositionError);

			if (Client.Speed.Y < 0) {
				FloorDown += Client.Speed.Y * Client.Config.Scale; //Moving downwards, extend raycast downwards
			} else if (Client.Speed.Y > 0) {
				FloorUp += Client.Speed.Y * Client.Config.Scale; //Moving upwards, move raycast upwards
			}

			const From = Client.Position.add(Client.Angle.UpVector.mul(FloorUp));
			const Direction = Client.Angle.UpVector.mul(FloorDown);
			let [Hit, Position, Normal] = Raycast(From, Direction);

			//Do additional collision checks
			if (Hit && Position && Normal) {
				let DropOff = false;

				if (Hit.FindFirstChild("NoFloor")) {
					//Floor cannot be stood on under any conditions
					DropOff = true;
				} else if (Client.Ground.Grounded) {
					//Don't stay on the floor if we're going too slow on a steep floor
					if (Client.Angle.UpVector.Dot(Normal) < 0.3) {
						DropOff = true;
					} else if (Normal.Dot(Client.Flags.Gravity.Unit.mul(-1)) < 0.4) {
						if ((Client.Speed.X ^ 2) + (Client.Speed.Z ^ 2) < (1.16 ^ 2)) {
							DropOff = true;
						}
					}
				} else {
					//Don't collide with the floor if we won't land at a speed fast enough to stay on it
					const NextSpeed = VUtil.Flatten(Client.ToGlobal(Client.Speed), Normal);
					const NextAng = GetAligned(Client, Normal);
					const NextLocalSpeed = NextAng.Inverse()
						.mul(NextSpeed)
						.mul(new Vector3(1, 0, 1));

					if (Normal.Dot(Client.Flags.Gravity.Unit.mul(-1)) < 0.4) {
						if (NextLocalSpeed.Magnitude < 1.16) {
							DropOff = true;
						}
					}
				}

				//Do simple collision
				if (DropOff) {
					Client.Speed = LocalVelCancel(Client, Client.Speed, Normal);
					Client.Position = Position;
					Hit = undefined;
				}
			}

			//Do standard floor collision
			if (Hit && Position && Normal) {
				//Snap to ground
				Client.Position = Position;
				Client.Ground.Floor = Hit;

				//Align with ground
				if (!Client.Ground.Grounded) {
					Client.Speed = VUtil.Flatten(Client.ToGlobal(Client.Speed), Normal);

					Client.Ground.Grounded = true;
					AlignNormal(Client, Normal);

					Client.Speed = Client.ToLocal(Client.Speed);
				} else {
					Client.Ground.Grounded = true;
					AlignNormal(Client, Normal);
				}

				//Kill any lingering vertical speed
				Client.Speed = Client.Speed.mul(new Vector3(1, 0, 1));
			} else {
				//Move vertically and unground
				Client.Position = Client.Position.add(Client.Angle.UpVector.mul(Client.Speed.Y * Client.Config.Scale));
				Client.Ground.Grounded = false;
				Client.Ground.Floor = undefined;
			}
		}

		//Check if we clipped through something from our previous position to our new position
		const NewMiddle = Client.GetMiddle();
		if (NewMiddle !== PreviousMiddle) {
			const NewAdd = NewMiddle.sub(PreviousMiddle).Unit.mul(Client.Config.Radius * Client.Config.Scale);
			const NewEnd = NewMiddle; // + new_add
			const [Hit, Position, Normal] = Raycast(PreviousMiddle, NewEnd.sub(PreviousMiddle));
			if (Hit && Position && Normal) {
				//Clip us out
				Client.Position = Client.Position.add(Position.sub(NewAdd).sub(NewMiddle));
				Client.Speed = LocalVelCancel(Client, Client.Speed.mul(0.8), Normal); // TODO: see if you can do without?
			} else {
				Client.Controller.Object.CollideWithClient();
				break;
			}
		} else {
			break;
		}
	}

	//Check if we're submerged in water
	//Client.flag.underwater = PointInWater(Client.pos + Client.GetUp() * (Client.Physics.height * Client.Physics.scale)) // TODO: water

	//Handle floor positioning
	if (Client.Flags.Gravity && Client.Ground.Floor) {
		Client.Ground.FloorOffset = Client.Ground.Floor.CFrame.Inverse().mul(Client.Angle.add(Client.Position));
		Client.Ground.FloorLast = Client.Ground.Floor.CFrame;
		if (!Client.Ground.FloorSpeed) {
			Client.Ground.FloorSpeed = Client.Ground.Floor.AssemblyLinearVelocity.div(Constants.Tickrate);
		}
	} else {
		Client.Ground.Floor = undefined;
		Client.Ground.FloorOffset = CFrame.identity;
		Client.Ground.FloorLast = undefined;

		Client.Speed = Client.Speed.add(Client.ToLocal(Client.Ground.FloorSpeed).div(Client.Config.Scale));

		Client.Ground.FloorSpeed = Vector3.zero;
	}
}

export function GetWallDot(Client: Client) {
	const Cast = Workspace.Raycast(Client.GetMiddle(), Client.Angle.LookVector.mul(math.max(Client.Speed.X, 5)), CollisionParams);
	return Cast ? math.max(Cast.Normal.Dot(Client.Angle.LookVector.mul(-1)), 0) : 0;
}

export function CanGetup(Client: Client) {
	return !Workspace.Raycast(Client.Position, Client.Angle.UpVector.mul(6), CollisionParams);
}