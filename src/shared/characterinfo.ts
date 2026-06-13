import type { CharacterType } from "./common/data";

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

export const AnimationSet = {
	AirBoost: {
		Sonic: "110608196824267",
		SuperSonic: "110608196824267",
		Shadow: "110608196824267",
		SuperShadow: "104741705781862",
	},
	Board: {
		Sonic: "101185720820753",
		SuperSonic: "101185720820753",
		Shadow: "101185720820753",
		SuperShadow: "86749363508662",
	},
	BoardFall: {
		Sonic: "105548922528701",
		SuperSonic: "105548922528701",
		Shadow: "105548922528701",
		SuperShadow: "102331859269749",
	},
	BoardRail: {
		Sonic: "123630512954522",
		SuperSonic: "123630512954522",
		Shadow: "123630512954522",
		SuperShadow: "70523052506125",
	},
	BounceJump: {
		Sonic: "139542483409958",
		SuperSonic: "139542483409958",
		Shadow: "139542483409958",
		SuperShadow: "77024564550420",
	},
	Dash: {
		Sonic: "102661612538948",
		SuperSonic: "102661612538948",
		Shadow: "102661612538948",
		SuperShadow: "104388172297812",
	},
	Die: {
		Sonic: "120664022242039",
		SuperSonic: "120664022242039",
		Shadow: "120664022242039",
		SuperShadow: "120373539227508",
	},
	DriftL: {
		Sonic: "92197203974920",
		SuperSonic: "92197203974920",
		Shadow: "92197203974920",
		SuperShadow: "111943269698176",
	},
	DriftR: {
		Sonic: "102945767532203",
		SuperSonic: "102945767532203",
		Shadow: "102945767532203",
		SuperShadow: "84380162909003",
	},
	Drown: {
		Sonic: "84242796026715",
		SuperSonic: "84242796026715",
		Shadow: "84242796026715",
		SuperShadow: "76514471197331",
	},
	Fall: {
		Sonic: "111617760676475",
		SuperSonic: "111617760676475",
		Shadow: "131126998454964",
		SuperShadow: "75500039644837",
	},
	FallForwards: {
		Sonic: "109104177047221",
		SuperSonic: "109104177047221",
		Shadow: "109104177047221",
		SuperShadow: "126307686396044",
	},
	Float: {
		Sonic: "129045082420291",
		SuperSonic: "129045082420291",
		Shadow: "129045082420291",
		SuperShadow: "107946073217754",
	},
	Grind: {
		Sonic: "124013876025741",
		SuperSonic: "124013876025741",
		Shadow: "124013876025741",
		SuperShadow: "131564928898386",
	},
	GrindJumpL: {
		Sonic: "70733268350869",
		SuperSonic: "70733268350869",
		Shadow: "70733268350869",
		SuperShadow: "93253916438452",
	},
	GrindJumpR: {
		Sonic: "129520032073132",
		SuperSonic: "129520032073132",
		Shadow: "129520032073132",
		SuperShadow: "79513036156115",
	},
	GrindLeanL: {
		Sonic: "137653600025802",
		SuperSonic: "137653600025802",
		Shadow: "137653600025802",
		SuperShadow: "72006214966703",
	},
	GrindLeanR: {
		Sonic: "79031473359768",
		SuperSonic: "79031473359768",
		Shadow: "79031473359768",
		SuperShadow: "83939913945701",
	},
	GrindStart: {
		Sonic: "70825164715794",
		SuperSonic: "70825164715794",
		Shadow: "70825164715794",
		SuperShadow: "73793301940987",
	},
	Grind_Crouch: {
		Sonic: "108656631864382",
		SuperSonic: "108656631864382",
		Shadow: "108656631864382",
		SuperShadow: "108656631864382",
	},
	HomingAttackTrick1: {
		Sonic: "74084308944453",
		SuperSonic: "74084308944453",
		Shadow: "74084308944453",
		SuperShadow: "135719150503212",
	},
	HomingAttackTrick2: {
		Sonic: "122193936732168",
		SuperSonic: "122193936732168",
		Shadow: "122193936732168",
		SuperShadow: "112646598403512",
	},
	HomingAttackTrick3: {
		Sonic: "130652025435919",
		SuperSonic: "130652025435919",
		Shadow: "130652025435919",
		SuperShadow: "135314267634170",
	},
	HomingAttackTrick4: {
		Sonic: "138295752745546",
		SuperSonic: "138295752745546",
		Shadow: "138295752745546",
		SuperShadow: "135087542950238",
	},
	HomingTrick1: {
		Sonic: "111566295489989",
		SuperSonic: "111566295489989",
		Shadow: "111566295489989",
		SuperShadow: "128141881700047",
	},
	HurdleL: {
		Sonic: "96043889431185",
		SuperSonic: "96043889431185",
		Shadow: "96043889431185",
		SuperShadow: "88626583884387",
	},
	HurdleR: {
		Sonic: "102502833371768",
		SuperSonic: "102502833371768",
		Shadow: "102502833371768",
		SuperShadow: "106753517218538",
	},
	Hurt: {
		Sonic: "106978981838754",
		SuperSonic: "106978981838754",
		Shadow: "106978981838754",
		SuperShadow: "133344429888589",
	},
	Idle: {
		Sonic: "105352110848646",
		SuperSonic: "131008149186890",
		Shadow: "108826820809868",
		SuperShadow: "118249854048830",
	},
	Idle_Action_1: {
		Sonic: "139293564681869",
		SuperSonic: "139293564681869",
		Shadow: "139293564681869",
		SuperShadow: "139293564681869",
	},
	Idle_Action_2: {
		Sonic: "81854782755600",
		SuperSonic: "81854782755600",
		Shadow: "81854782755600",
		SuperShadow: "81854782755600",
	},
	Idle_Action_3: {
		Sonic: "129965590702269",
		SuperSonic: "129965590702269",
		Shadow: "129965590702269",
		SuperShadow: "129965590702269",
	},
	Idle_Action_4: {
		Sonic: "129909080230102",
		SuperSonic: "129909080230102",
		Shadow: "129909080230102",
		SuperShadow: "129909080230102",
	},
	Idle_Action_5: {
		Sonic: "98867330141570",
		SuperSonic: "98867330141570",
		Shadow: "98867330141570",
		SuperShadow: "98867330141570",
	},
	Idle_Action_6: {
		Sonic: "108728417837575",
		SuperSonic: "108728417837575",
		Shadow: "108728417837575",
		SuperShadow: "108728417837575",
	},
	Jog2: {
		Sonic: "81324249491302",
		SuperSonic: "102098714500260",
		Shadow: "94376630136983",
		SuperShadow: "90473305811748",
	},
	JogIntoRun: {
		Sonic: "84815440676414",
		SuperSonic: "84815440676414",
		Shadow: "84815440676414",
		SuperShadow: "96394191157454",
	},
	JumpPadLaunch: {
		Sonic: "101247600385290",
		SuperSonic: "101247600385290",
		Shadow: "101247600385290",
		SuperShadow: "140381279570718",
	},
	JumpPadStick: {
		Sonic: "73080808429520",
		SuperSonic: "73080808429520",
		Shadow: "73080808429520",
		SuperShadow: "80477230811987",
	},
	Land: {
		Sonic: "97312287771356",
		SuperSonic: "125530230754908",
		Shadow: "104405294217580",
		SuperShadow: "107444367333994",
	},
	LandRoll: {
		Sonic: "101123232860096",
		SuperSonic: "101123232860096",
		Shadow: "101123232860096",
		SuperShadow: "98237013229032",
	},
	LandRun: {
		Sonic: "98652006846113",
		SuperSonic: "98652006846113",
		Shadow: "98652006846113",
		SuperShadow: "91921753836266",
	},
	LandShort: {
		Sonic: "93740605386871",
		SuperSonic: "93740605386871",
		Shadow: "93740605386871",
		SuperShadow: "100441081511952",
	},
	LedgeGrabJump: {
		Sonic: "118662828474557",
		SuperSonic: "118662828474557",
		Shadow: "118662828474557",
		SuperShadow: "101816457730066",
	},
	MaxRun: {
		Sonic: "93690998175131",
		SuperSonic: "110608196824267",
		Shadow: "120213239659944",
		SuperShadow: "110608196824267",
	},
	Pulley: {
		Sonic: "112877369206861",
		SuperSonic: "112877369206861",
		Shadow: "112877369206861",
		SuperShadow: "127827610003926",
	},
	ReadySetGo: {
		Sonic: "136601519800969",
		SuperSonic: "136601519800969",
		Shadow: "136601519800969",
		SuperShadow: "106901567473836",
	},
	Roll: {
		Sonic: "117789009990286",
		SuperSonic: "117789009990286",
		Shadow: "117789009990286",
		SuperShadow: "88639522961554",
	},
	RollExit: {
		Sonic: "72179406493851",
		SuperSonic: "72179406493851",
		Shadow: "72179406493851",
		SuperShadow: "96126551556440",
	},
	RollToFall: {
		Sonic: "92656823060249",
		SuperSonic: "92656823060249",
		Shadow: "92656823060249",
		SuperShadow: "87157079840761",
	},
	Run: {
		Sonic: "83246255701422",
		SuperSonic: "85570185071834",
		Shadow: "104699873809656",
		SuperShadow: "119630957836507",
	},
	RunJet: {
		Sonic: "122207631515391",
		SuperSonic: "71254390295246",
		Shadow: "134216841172243",
		SuperShadow: "95057208027069",
	},
	ShadowHoming: {
		Sonic: "112240306187642",
		SuperSonic: "112240306187642",
		Shadow: "112240306187642",
		SuperShadow: "77379221068124",
	},
	SidestepL: {
		Sonic: "139663693111795",
		SuperSonic: "139663693111795",
		Shadow: "139663693111795",
		SuperShadow: "102702561244599",
	},
	SidestepR: {
		Sonic: "111246244102011",
		SuperSonic: "111246244102011",
		Shadow: "111246244102011",
		SuperShadow: "134970456885487",
	},
	Skid: {
		Sonic: "108533322617954",
		SuperSonic: "108533322617954",
		Shadow: "108533322617954",
		SuperShadow: "125202814894972",
	},
	Skydive: {
		Sonic: "93552861843757",
		SuperSonic: "93552861843757",
		Shadow: "93552861843757",
		SuperShadow: "80885896840108",
	},
	SkydiveFast: {
		Sonic: "76072691640147",
		SuperSonic: "76072691640147",
		Shadow: "76072691640147",
		SuperShadow: "112105991467333",
	},
	Slide: {
		Sonic: "106843760093894",
		SuperSonic: "106843760093894",
		Shadow: "106843760093894",
		SuperShadow: "91399583315902",
	},
	SlideToFall: {
		Sonic: "122740985785775",
		SuperSonic: "122740985785775",
		Shadow: "122740985785775",
		SuperShadow: "113394243807708",
	},
	Spindash: {
		Sonic: "117789009990286",
		SuperSonic: "117789009990286",
		Shadow: "117789009990286",
		SuperShadow: "117789009990286",
	},
	SpindashStart: {
		Sonic: "124723429511175",
		SuperSonic: "124723429511175",
		Shadow: "124723429511175",
		SuperShadow: "138049799152094",
	},
	SplitCharge: {
		Sonic: "136841461423615",
		SuperSonic: "136841461423615",
		Shadow: "136841461423615",
		SuperShadow: "138129781468941",
	},
	SpringFall: {
		Sonic: "137798639561758",
		SuperSonic: "137798639561758",
		Shadow: "137798639561758",
		SuperShadow: "108710290613508",
	},
	SpringFallRecover: {
		Sonic: "94969310900746",
		SuperSonic: "94969310900746",
		Shadow: "94969310900746",
		SuperShadow: "117539127478524",
	},
	SpringJump: {
		Sonic: "98700875586678",
		SuperSonic: "98700875586678",
		Shadow: "110625036608476",
		SuperShadow: "127789518351770",
	},
	Stomp: {
		Sonic: "109461942314833",
		SuperSonic: "109461942314833",
		Shadow: "109461942314833",
		SuperShadow: "137128318393191",
	},
	SuperTransformation: {
		Sonic: "89961947659680",
		SuperSonic: "89961947659680",
		Shadow: "89961947659680",
		SuperShadow: "107538327880340",
	},
	TimeTrialWin: {
		Sonic: "103098586385977",
		SuperSonic: "103098586385977",
		Shadow: "103098586385977",
		SuperShadow: "76901531666580",
	},
	TripFall: {
		Sonic: "137863251080481",
		SuperSonic: "137863251080481",
		Shadow: "137863251080481",
		SuperShadow: "70538850920429",
	},
	Walk1: {
		Sonic: "73615066999712",
		SuperSonic: "73615066999712",
		Shadow: "73615066999712",
		SuperShadow: "139894277855736",
	},
	Walk2: {
		Sonic: "114214606096837",
		SuperSonic: "114214606096837",
		Shadow: "114214606096837",
		SuperShadow: "98647423449592",
	},
	WalkFast: {
		Sonic: "112680865770783",
		SuperSonic: "112680865770783",
		Shadow: "112680865770783",
		SuperShadow: "91573752077964",
	},
	WalkStart: {
		Sonic: "137424310524824",
		SuperSonic: "137424310524824",
		Shadow: "137424310524824",
		SuperShadow: "99363747658906",
	},
	WallRun: {
		Sonic: "137222971516667",
		SuperSonic: "137222971516667",
		Shadow: "137222971516667",
		SuperShadow: "79087546217166",
	},
	Walljump: {
		Sonic: "75736012040543",
		SuperSonic: "75736012040543",
		Shadow: "75736012040543",
		SuperShadow: "118156015621765",
	},
	Zipline: {
		Sonic: "90671379482838",
		SuperSonic: "90671379482838",
		Shadow: "90671379482838",
		SuperShadow: "96553311601005",
	},
} as const satisfies {
	[Index: string]: {
		[Index in CharacterType]: string;
	};
};

export const CharacterInfo = {
	Physics: {
		// Collision
		Height: 5,
		Scale: 0.6,
		Radius: 3,
		PositionError: 2,

		// Physics
		Weight: 0.08,

		// Speed
		MaxXSpeed: 4,
		JogSpeed: 0.25,
		RunSpeed: .85,
		RushSpeed: 1.95,
		DashSpeed: 5.09,
		CrashSpeed: 3.7, // Used in Grounded's acceleration animation speed check
		RollGetup: 1.39, // Point at which the roll state should uncurl you

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

		// Renderer
		CameraOffset: new Vector3(0, 2, 0),
	},

	Animations: {
		Land: {
			0: { AnimationKey: "Land", Looped: true },
		},
		Idle: {
			0: { AnimationKey: "Idle", Looped: true },
		},
		Roll: {
			0: { AnimationKey: "Roll", Looped: true, Speed: { Base: 0.25, Increment: 1 / 8, Absolute: true } },
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
					Base: .9,
					Increment: 0.5,
					Absolute: false,
				},
				Looped: true,
			},
			1: {
				AnimationKey: "Run",
				Position: 2.15,
				Speed: {
					Base: .75,
					Increment: 0.55,
					Absolute: false,
				},
				Looped: true,
			},
			2: {
				AnimationKey: "Dash",
				Position: 3.95,
				Speed: {
					Base: .65,
					Increment: 0.6,
					Absolute: false,
				},
				Looped: true,
			},
			3: {
				AnimationKey: "MaxRun",
				Position: 5.5,
				Speed: {
					Base: .9,
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
