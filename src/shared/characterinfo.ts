import type { AnimationSet } from "./common/globals";

export type ValidAnimation = keyof (typeof CharacterInfo)["Animations"];
export type AnimationKey = keyof typeof AnimationSet;
export interface InferredAnimation {
	[Index: number]: {
		AnimationKey: AnimationKey;
		Asset: AnimationTrack;
		Position?: number;
		Looped: boolean;
		Speed?: {
			Base: number;
			Increment: number;
			Absolute: boolean;
		};
	};
}

export interface AnimationData {
	EndAnimation?: keyof (typeof CharacterInfo)["Animations"];
	Transitions?: {
		[Index: string]: {
			From?: number;
			To?: number;
		};
	};
}

export type SetAnimation = InferredAnimation & AnimationData;

export const CharacterInfo = {
	Config: {
		// Collision
		Height: 5,
		Scale: 0.6,
		Radius: 3,
		PositionError: 2,

		// Physics
		Weight: 0.08,

		// Speed
		MaxXSpeed: 4,
		JogSpeed: 0.75,
		RunSpeed: 1.45,
		RushSpeed: 1.95,
		DashSpeed: 5.09,
		CrashSpeed: 3.7, // Used in Grounded's acceleration animation speed check
		RollGetup: 1.39, // Point at which the roll state should uncurl you
		TurnStartSpeed: 2, // Minimum speed before your turn rate starts degrading
		TurnDecayRate: 0.425, // Turning decay rate

		// Acceleration
		AirAcceleration: 0.031,
		RunAcceleration: 0.025,
		AirDeceleration: -0.17,
		StandardDeceleration: -0.06,
		AirResist: new Vector3(-0.008, -0.01, -0.4),

		// Jump
		JumpInitalForce: 1.66,
		JumpHoldForce: 0.076,
		JumpTicks: 60,
		CoyoteFrames: 10,

		// Friction
		SkidFriction: -0.18,
		GroundFriction: new Vector3(-0.1, 0, -0.6),

		// Moves
		HomingForce: { AirDash: new Vector3(6, 1, 0), HomingAttack: 5.25 },
		SlideTurnRate: math.rad(5),

		// Renderer
		CameraOffset: 6,
	},

	Animations: {
		Land: {
			0: { AnimationKey: "Land", Looped: false },
			EndAnimation: "Idle",
		},
		LandShort: {
			0: { AnimationKey: "LandShort", Looped: false },
			EndAnimation: "Idle",
		},
		LandMoving: {
			0: { AnimationKey: "LandRoll", Looped: false },
			EndAnimation: "Run",
		},
		Idle: {
			0: { AnimationKey: "Idle", Looped: true },
		},
		Roll: {
			0: { AnimationKey: "Roll", Looped: true, Speed: { Base: 0.65, Increment: 1 / 4, Absolute: true } },
		},
		Spindash: {
			0: { AnimationKey: "Spindash", Looped: true },
		},
		Fall: {
			0: { AnimationKey: "Fall", Looped: true },
		},
		Skid: {
			0: { AnimationKey: "Skid", Looped: true },
			EndAnimation: "Idle",
		},
		Spring: {
			0: { AnimationKey: "SpringJump", Looped: true },
		},
		Run: {
			0: {
				AnimationKey: "Jog2",
				Position: 0,
				Speed: {
					Base: 0.9,
					Increment: 0.5,
					Absolute: false,
				},
				Looped: true,
			},
			1: {
				AnimationKey: "Run",
				Position: 2.15,
				Speed: {
					Base: 0.75,
					Increment: 0.55,
					Absolute: false,
				},
				Looped: true,
			},
			2: {
				AnimationKey: "Dash",
				Position: 3.95,
				Speed: {
					Base: 0.65,
					Increment: 0.6,
					Absolute: false,
				},
				Looped: true,
			},
			3: {
				AnimationKey: "MaxRun",
				Position: 5.5,
				Speed: {
					Base: 0.9,
					Increment: 0.4,
					Absolute: false,
				},
				Looped: true,
			},
		},
		Rail: {
			0: { AnimationKey: "Grind", Looped: true },
		},
		RailSwitchLeft: {
			0: { AnimationKey: "GrindJumpL", Looped: false },
		},
		RailSwitchRight: {
			0: { AnimationKey: "GrindJumpR", Looped: false },
		},
		Stomp: {
			0: { AnimationKey: "Stomp", Looped: true },
		},
		StompLand: {
			0: { AnimationKey: "Land", Looped: false },
			EndAnimation: "Fall",
		},
		AirBoost: {
			0: { AnimationKey: "AirBoost", Looped: true },
		},
		Slide: {
			0: { AnimationKey: "Slide", Looped: true },
		},
		Hurt: {
			0: { AnimationKey: "Hurt", Looped: true },
		},
		Die: {
			0: { AnimationKey: "Die", Looped: false },
		},
	} as const satisfies {
		[Index: string]: {
			[Index: number]: {
				AnimationKey: AnimationKey;
				Position?: number;
				Looped: boolean;
				Speed?: {
					Base: number;
					Increment: number;
					Absolute: boolean;
				};
			};
		} & {
			EndAnimation?: string;
			Transitions?: {
				[Index: string]: {
					From?: number;
					To?: number;
				};
			};
		};
	},
};

export const Animations = {};
