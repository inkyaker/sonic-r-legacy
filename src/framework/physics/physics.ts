import type BaseObject from "framework/object/objects/baseobj";
import { workspace } from "shared/common/globals";
import * as CFUtil from "shared/common/utility/cfutil";
import * as VUtil from "shared/common/utility/vutil";
import type { Client } from "..";

export enum IntertiaState {
	FULL_INERTIA,
	GROUND_NOFRICT,
}

export const PhysicsHandler = {
	// Acceleration
	/**
	 * Apply grounded acceleration, gravity calculations are separate
	 * @param Client
	 */
	AccelerateGrounded: (Client: Client) => {
		const MaxXSpeed = Client.Config.MaxXSpeed;
		const RunAcceleration = Client.GetRunAcceleration();
		const Friction = /*self.flag.grounded and self.frict_mult*/ 1 || 1;

		//Get analogue state
		let Acceleration = new Vector3(0, 0, 0);
		let MovementAcceleration = 0;
		let [HasControl, Turn, Magnitude] = Client.Input.Get();

		//X air drag
		// TODO: see if i can improve
		if (HasControl) {
			if (Client.Speed.X <= MaxXSpeed || Client.Ground.DotProduct <= 0.96) {
				if (Client.Speed.X > MaxXSpeed) {
					Acceleration = Acceleration.add(new Vector3((Client.Speed.X - MaxXSpeed) * Client.Config.AirResist.X, 0, 0));
				} else if (Client.Speed.X < 0) {
					Acceleration = Acceleration.add(new Vector3(Client.Speed.X * Client.Config.AirResist.X, 0, 0));
				}
			} else {
				Acceleration = Acceleration.add(new Vector3((Client.Speed.X - MaxXSpeed) * (Client.Config.AirResist.X * 1.7), 0, 0));
			}
		} else {
			if (Client.Speed.X > Client.Config.RunSpeed) {
				Acceleration = Acceleration.add(new Vector3(Client.Speed.X * Client.Config.AirResist.X));
			} else if (Client.Speed.X > MaxXSpeed) {
				Acceleration = Acceleration.add(new Vector3((Client.Speed.X - MaxXSpeed) * Client.Config.AirResist.X));
			} else if (Client.Speed.X < 0) {
				Acceleration = Acceleration.add(new Vector3(Client.Speed.X * Client.Config.AirResist.X));
			}
		}

		//Y and Z air drag
		Client.Speed = Client.Speed.add(Client.Speed.mul(new Vector3(0, Client.Config.AirResist.Y, Client.Config.AirResist.Z)));

		//Movement
		if (HasControl) {
			//Get acceleration
			if (Client.Speed.X >= MaxXSpeed) {
				//Use lower acceleration if above max speed
				if (Client.Speed.X < MaxXSpeed || Client.Ground.DotProduct >= 0) {
					MovementAcceleration = RunAcceleration * Magnitude * 0.4;
				} else {
					MovementAcceleration = RunAcceleration * Magnitude;
				}
			} else {
				//Get acceleration, stopping at intervals based on analogue stick magnitude
				MovementAcceleration = 0;

				if (Client.Speed.X >= Client.Config.JogSpeed) {
					if (Client.Speed.X >= Client.Config.RunSpeed) {
						if (Magnitude <= 0.9) {
							MovementAcceleration = RunAcceleration * Magnitude * 0.3;
						} else {
							MovementAcceleration = RunAcceleration * Magnitude;
						}
					} else if (Magnitude <= 0.7) {
						if (Client.Speed.X < Client.Config.RunSpeed) {
							MovementAcceleration = RunAcceleration * Magnitude;
						}
					} else {
						MovementAcceleration = RunAcceleration * Magnitude;
					}
				} else if (Magnitude <= 0.5) {
					if (Client.Speed.X < (Client.Config.JogSpeed + Client.Config.RunSpeed) * 0.5) {
						MovementAcceleration = RunAcceleration * Magnitude;
					}
				} else {
					MovementAcceleration = RunAcceleration * Magnitude;
				}
			}

			//Turning
			const AbsoluteTurn = math.abs(Turn);
			if (math.abs(Client.Speed.X) < 0.001 && AbsoluteTurn > math.rad(22.5)) {
				MovementAcceleration = 0;
				PhysicsHandler.Turn(Client, Turn, IntertiaState.FULL_INERTIA);
			} else {
				if (Client.Speed.X < (Client.Config.JogSpeed + Client.Config.RunSpeed) * 0.5 || AbsoluteTurn <= math.rad(22.5)) {
					if (Client.Speed.X < Client.Config.JogSpeed || AbsoluteTurn >= math.rad(22.5)) {
						if (Client.Speed.X < Client.Config.DashSpeed || !Client.Ground.Grounded) {
							if (Client.Speed.X >= Client.Config.JogSpeed && Client.Speed.X <= Client.Config.RushSpeed && AbsoluteTurn > math.rad(45)) MovementAcceleration *= 0.8;

							PhysicsHandler.Turn(Client, Turn, undefined);
						} else PhysicsHandler.Turn(Client, Turn, IntertiaState.GROUND_NOFRICT);
					} else PhysicsHandler.Turn(Client, Turn, IntertiaState.GROUND_NOFRICT);
				} else {
					MovementAcceleration = Client.Config.StandardDeceleration / Friction;
					PhysicsHandler.Turn(Client, Turn, undefined);
				}
			}
		} else MovementAcceleration = PhysicsHandler.GetDecel(Client.Speed.X + Acceleration.X, Client.Config.StandardDeceleration); // Decelerate

		//Apply movement acceleration
		Acceleration = Acceleration.add(new Vector3(MovementAcceleration * Friction, 0, 0));

		//Apply acceleration
		Client.Speed = Client.Speed.add(Acceleration);
	},

	/**
	 * Apply airborne acceleration, gravity calculations are separate
	 * @param Client
	 */
	AccelerateAirborne: (Client: Client) => {
		//Get analogue state
		const [HasControl, Turn, Magnitude] = Client.Input.Get();

		//Air drag
		Client.Speed = Client.Speed.add(Client.Speed.mul(Client.GetAirResist()).div(1 + Client.Rail.RailTrick));

		//Use lighter gravity if A is held or doing a rail trick
		if (Client.Rail.RailTrick > 0 || (Client.Flags.JumpTimer > 0 && Client.Flags.BallEnabled && Client.Input.Button.Jump.IsDown)) {
			Client.Flags.JumpTimer--;
			Client.Speed = Client.Speed.add(new Vector3(0, Client.Config.JumpHoldForce * 0.8 * (1 + Client.Rail.RailTrick / 2), 0));
		}

		//Get our acceleration
		const DoSkid = Client.Speed.X <= Client.Config.RunSpeed || math.abs(Turn) <= math.rad(135);
		if (DoSkid) {
			PhysicsHandler.Turn(Client, Turn);
		}
		const Acceleration =
			Client.Rail.RailTrick > 0
				? Client.Config.AirAcceleration * (1 + Client.Rail.RailTrick / 2.5)
				: !HasControl
					? 0
					: // Check for skid
						DoSkid
						? math.abs(Turn) <= math.rad(22.5)
							? Client.Config.AirAcceleration * Magnitude * ((Client.Speed.Y >= 0 && 2) || 1)
							: 0
						: // Air brake
							Client.Config.AirDeceleration * Magnitude;

		//Accelerate
		Client.Speed = Client.Speed.add(Vector3.xAxis.mul(Acceleration));
	},

	// Gravity
	ApplyGravity: (Client: Client) => {
		if (Client.IsScripted()) return;

		const Weight = Client.GetWeight();
		const FloorCrossSpeed = Client.Angle.UpVector.Cross(Client.ToGlobal(Client.Speed));
		let GravityAcceleration = Client.ToLocal(Client.Flags.Gravity.mul(Weight));
		if (Client.Ground.DotProduct < 0.875) {
			if (Client.Ground.DotProduct >= 0.1 || math.abs(FloorCrossSpeed.Y) <= 0.6 || Client.Speed.X < 1.16) {
				if (Client.Ground.DotProduct >= -0.4 || Client.Speed.X <= 1.16)
					if (Client.Ground.DotProduct < -0.3 && Client.Speed.X > 1.16) {
					} else if (Client.Ground.DotProduct < -0.1 && Client.Speed.X > 1.16) {
					} else if (Client.Ground.DotProduct < 0.5 && math.abs(Client.Speed.X) < Client.Config.RunSpeed)
						GravityAcceleration = GravityAcceleration.mul(new Vector3(4.225, 1, 4.225));
					else if (Client.Ground.DotProduct >= 0.7 || math.abs(Client.Speed.X) > Client.Config.RunSpeed)
						if (Client.Ground.DotProduct >= 0.87 || Client.Config.JogSpeed <= math.abs(Client.Speed.X)) {
						} else GravityAcceleration = GravityAcceleration.mul(new Vector3(1, 1, 1.4));
					else GravityAcceleration = GravityAcceleration.mul(new Vector3(1, 1, 2));
			} else GravityAcceleration = new Vector3(0, -Weight, 0);
		} else GravityAcceleration = new Vector3(0, -Weight, 0);

		Client.Speed = Client.Speed.add(GravityAcceleration);
	},

	// Movement
	AlignToGravity: (Client: Client) => {
		if (Client.IsScripted()) return;

		//Remember previous speed
		const PrevSpeed = Client.ToGlobal(Client.Speed);

		//Get next angle
		const From = Client.Angle.UpVector;
		const To = Client.Flags.Gravity.Unit.mul(-1);
		const Turn = VUtil.Angle(From, To);

		if (Turn !== 0) {
			const MaxTurn = math.rad(11.25);
			const LimitedTurn = math.clamp(Turn, -MaxTurn, MaxTurn);
			const NextAngle = CFUtil.FromToRotation(From, To).mul(Client.Angle);

			Client.SetAngle(Client.Angle.Lerp(NextAngle, LimitedTurn / Turn));
		}

		//Keep using previous speed
		Client.Speed = Client.ToLocal(PrevSpeed);
	},

	RotateWithGravity: (Client: Client) => {
		const GlobalSpeed = Client.ToGlobal(Client.Speed);
		const DotProduct = GlobalSpeed.Unit.Dot(Client.Flags.Gravity.Unit);

		if (GlobalSpeed.Magnitude <= Client.Config.JogSpeed || DotProduct >= -0.86) {
			let Gravity = Client.ToLocal(Client.Flags.Gravity.Unit);

			if (Gravity.Y <= 0 && Gravity.Y > -0.87) {
				const Turn = -math.atan2(Gravity.Z, math.abs(Gravity.X));
				const MaxTurn = math.abs(Gravity.Z) * math.rad(8.4375);

				PhysicsHandler.TurnRaw(Client, math.clamp(Turn, -MaxTurn, MaxTurn));
			}
		}
	},

	/**
	 * Slowdown function to emulate skidding
	 *
	 * Used in `Skid` and `Spindash`
	 * @param Client
	 */
	Skid: (Client: Client) => {
		const FrictionMultiplier = 1; // TODO: fricton mult

		const XFriction = Client.Config.SkidFriction * FrictionMultiplier;
		const ZFriction = Client.Config.GroundFriction.Z * FrictionMultiplier;

		Client.Speed = Client.Speed.add(Client.Speed.mul(Client.Config.AirResist)).add(
			new Vector3(PhysicsHandler.GetDecel(Client.Speed.X, XFriction), 0, PhysicsHandler.GetDecel(Client.Speed.Z, ZFriction)),
		);
	},

	/**
	 * Replacement function for `AccelerateGrounded` and `AccelerateAirborne` for the `Roll` state, disables acceleration and keeps speed. Includes gravity
	 * @param Client
	 */
	ApplyInertia: (Client: Client) => {
		const Weight = Client.GetWeight();
		let Acceleration = Client.ToLocal(Client.Flags.Gravity.mul(Weight));

		if (Client.Ground.Grounded && Client.Speed.X > Client.Config.RunSpeed && Client.Ground.DotProduct < 0) Acceleration = Acceleration.mul(new Vector3(1, -8, 1));
		if (Client.Flags.BallEnabled && Client.Ground.DotProduct < 0.98) Acceleration = Acceleration.add(new Vector3(Client.Speed.X * -0.0002, 0, 0));
		else Acceleration = Acceleration.add(new Vector3(Client.Speed.X * Client.Config.AirResist.X, 0, 0));

		Acceleration = Acceleration.add(new Vector3(0, Client.Speed.Y, Client.Speed.Z).mul(Client.Config.AirResist.Z));

		Client.Speed = Client.Speed.add(Acceleration);
	},

	// Turning
	/**
	 * Raw turning function used in the main Client.Turn function, will directly rotate the Clients Y axis
	 *
	 * Do not use over Client.Turn unless you want to snap the angle!
	 * @param Client
	 * @param Turn Amount in radians to turn
	 */
	TurnRaw: (Client: Client, Turn: number) => {
		Client.Angle = Client.Angle.mul(CFrame.Angles(0, Turn, 0));
	},

	/**
	 * Turning function, limits max angle to smooth out turns, use over `TurnRaw`
	 *
	 * `IState` Options:
	 *
	 *      undefined - Regular turning, variable max turn
	 *      InertiaState.FULL_INERTIA - Max turning limited to 45, turns with 100% inertia
	 *      InertiaState.GROUND_NOFRICT - Similar to undefined calculations, but assumes grounded & ignores low friction
	 *
	 * @param Client
	 * @param Turn Amount in radians to turn
	 * @param IState Inertia configs to match Digital Swirl
	 */
	Turn: (Client: Client, Turn: number, IState?: IntertiaState) => {
		let MaxTurn = math.abs(Turn);
		const [HasControl] = Client.Input.Get();
		const PreviousSpeed = Client.ToGlobal(Client.Speed);

		/*
            UNDEFINED: Y
            FULL_INERTIA: YQ
            GROUND_NOFRICT: YS
        */
		if (IState === undefined) {
			// cannot do !IState?
			if (MaxTurn <= math.rad(45)) {
				if (MaxTurn <= math.rad(22.5)) {
					MaxTurn /= 8;
				} else {
					MaxTurn /= 4;
				}
			} else {
				MaxTurn = math.rad(11.25);
			}
		} else if (IState === IntertiaState.FULL_INERTIA) {
			MaxTurn = math.clamp(Turn, math.rad(-45), math.rad(45));
		} else if (IState === IntertiaState.GROUND_NOFRICT) {
			MaxTurn = math.rad(1.40625);
			if (Client.Speed.X > Client.Config.DashSpeed) {
				MaxTurn = math.max(MaxTurn - math.sqrt((Client.Speed.X - Client.Config.DashSpeed) * 0.0625) * MaxTurn, 0);
			}
		}

		MaxTurn = math.abs(MaxTurn);

		if (Client.Speed.X > Client.Config.TurnStartSpeed) MaxTurn *= math.exp(-Client.Config.TurnDecayRate * (Client.Speed.X - Client.Config.TurnStartSpeed));

		//Turn
		PhysicsHandler.TurnRaw(Client, math.clamp(Turn, -MaxTurn, MaxTurn));

		if (IState === undefined) {
			if (!Client.Ground.Grounded) {
				Client.Speed = Client.Speed.mul(0.1).add(Client.ToLocal(PreviousSpeed).mul(0.9));
			} else {
				let Inertia: number;

				if (HasControl) {
					if (Client.Ground.DotProduct <= 0.4) {
						Inertia = 0.5;
					} else {
						Inertia = 0.01;
					}
				} else {
					Inertia = 0.95;
				}

				/*
                if self.frict_mult < 1 then
                    inertia *= self.frict_mult
                end
                */

				Client.Speed = Client.Speed.mul(1 - Inertia).add(Client.ToLocal(PreviousSpeed).mul(Inertia));
			}
		} else if (IState === IntertiaState.FULL_INERTIA) {
			Client.Speed = Client.ToLocal(PreviousSpeed);
		} else if (IState === IntertiaState.GROUND_NOFRICT) {
			let Inertia: number;
			if (Client.Ground.DotProduct <= 0.4) {
				Inertia = 0.5;
			} else {
				Inertia = 0.01;
			}

			Client.Speed = Client.Speed.mul(1 - Inertia).add(Client.ToLocal(PreviousSpeed).mul(Inertia));
		}
	},

	/**
	 * Deceleration calculation
	 *
	 * @param Speed Number to decelerate
	 * @param Deceleration Maximum deceleration rate
	 * @returns Applied deceleration speed
	 */
	GetDecel(Speed: number, Deceleration: number) {
		if (Speed > 0) {
			return -math.min(Speed, -Deceleration);
		} else if (Speed < 0) {
			return math.min(-Speed, -Deceleration);
		}
		return 0;
	},

	ObjectParams: new OverlapParams(),
	MapCollision: new RaycastParams(),

	/**
	 * Get targeted object for homing attack
	 */
	GetHomingObject(Client: Client): BaseObject<Model> | undefined {
		const Look = Client.Angle.LookVector;
		const Colliders = workspace.GetPartBoundsInRadius(Client.Position, 100 * Client.Config.Scale, PhysicsHandler.ObjectParams);
		const Objects = [];

		for (const [_, Collider] of pairs(Colliders)) {
			const Object = Client.Controller.Object.GetObject(Collider);
			if (!Object?.HomingTarget) continue;

			const Center = Collider.Position;
			const Offset = Center.sub(Client.Position);
			const Dot = Offset.mul(new Vector3(1, 0, 1)).Unit.Dot(Look);
			const Hit = workspace.Raycast(Client.Position, Offset, PhysicsHandler.MapCollision);
			const YOff = Collider.CFrame.PointToObjectSpace(Client.Position).Y;
			const PosValid = -YOff <= 20 * Client.Config.Scale;

			if (Dot >= 0.3825 && !Hit && PosValid) Objects.push({ Object: Object, Distance: 1 - Offset.Magnitude / 30, Dot: Dot, Weight: Object.HomingWeight });
		}

		Objects.sort((A, B) => {
			return A.Distance + A.Dot * 0.5 + A.Weight > B.Distance + B.Dot * 0.5 + B.Weight;
		});

		return Objects[0]?.Object;
	},
};

PhysicsHandler.ObjectParams.FilterType = Enum.RaycastFilterType.Include;
PhysicsHandler.ObjectParams.AddToFilter(workspace.Level.Objects);

PhysicsHandler.MapCollision.FilterType = Enum.RaycastFilterType.Include;
PhysicsHandler.MapCollision.AddToFilter(workspace.Level.Map.Collision);
