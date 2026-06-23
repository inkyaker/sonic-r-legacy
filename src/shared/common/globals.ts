import { SoundService as Sounds, Workspace } from "@rbxts/services";
import type { CharacterType } from "./data";

export const workspace = Workspace as Workspace & {
	Level: Folder & {
		Effects: Folder;
		Map: Folder & {
			Collision: Folder;
		};
		Objects: Folder;
		Rails: Folder;
		Water: Folder;
	};
};

export const SoundService = Sounds as SoundService & {
	CharacterSFX: SoundGroup;
	Music: SoundGroup;
	ObjectSFX: SoundGroup;
};

export const BallTrailColors: { [K in CharacterType]: Color3 } = {
	Sonic: new Color3(0.11, 0.49, 1),
	Shadow: new Color3(0.99, 0.27, 0.05),
	SuperSonic: new Color3(0.91, 0.78, 0.05),
	SuperShadow: new Color3(0.91, 0.78, 0.05),
	None: new Color3(1, 1, 1),
};

export type AnimationSetData = {
	[K in CharacterType]?: string;
} & {
	Default: string;
};

export const AnimationSet = {
	AirBoost: {
		SuperShadow: "104741705781862",
		Default: "110608196824267",
	},
	Board: {
		SuperShadow: "86749363508662",
		Default: "101185720820753",
	},
	BoardFall: {
		SuperShadow: "102331859269749",
		Default: "105548922528701",
	},
	BoardRail: {
		SuperShadow: "70523052506125",
		Default: "123630512954522",
	},
	BounceJump: {
		SuperShadow: "77024564550420",
		Default: "139542483409958",
	},
	Dash: {
		SuperShadow: "104388172297812",
		Default: "102661612538948",
	},
	Die: {
		SuperShadow: "120373539227508",
		Default: "120664022242039",
	},
	DriftL: {
		SuperShadow: "111943269698176",
		Default: "92197203974920",
	},
	DriftR: {
		SuperShadow: "84380162909003",
		Default: "102945767532203",
	},
	Drown: {
		SuperShadow: "76514471197331",
		Default: "84242796026715",
	},
	Fall: {
		Shadow: "131126998454964",
		SuperShadow: "75500039644837",
		Default: "111617760676475",
	},
	FallForwards: {
		SuperShadow: "126307686396044",
		Default: "109104177047221",
	},
	Float: {
		SuperShadow: "107946073217754",
		Default: "129045082420291",
	},
	Grind: {
		SuperShadow: "131564928898386",
		Default: "124013876025741",
	},
	GrindJumpL: {
		SuperShadow: "93253916438452",
		Default: "70733268350869",
	},
	GrindJumpR: {
		SuperShadow: "79513036156115",
		Default: "129520032073132",
	},
	GrindLeanL: {
		SuperShadow: "72006214966703",
		Default: "137653600025802",
	},
	GrindLeanR: {
		SuperShadow: "83939913945701",
		Default: "79031473359768",
	},
	GrindStart: {
		SuperShadow: "73793301940987",
		Default: "70825164715794",
	},
	Grind_Crouch: {
		Default: "108656631864382",
	},
	HomingAttackTrick1: {
		SuperShadow: "135719150503212",
		Default: "74084308944453",
	},
	HomingAttackTrick2: {
		SuperShadow: "112646598403512",
		Default: "122193936732168",
	},
	HomingAttackTrick3: {
		SuperShadow: "135314267634170",
		Default: "130652025435919",
	},
	HomingAttackTrick4: {
		SuperShadow: "135087542950238",
		Default: "138295752745546",
	},
	HomingTrick1: {
		SuperShadow: "128141881700047",
		Default: "111566295489989",
	},
	HurdleL: {
		SuperShadow: "88626583884387",
		Default: "96043889431185",
	},
	HurdleR: {
		SuperShadow: "106753517218538",
		Default: "102502833371768",
	},
	Hurt: {
		SuperShadow: "133344429888589",
		Default: "106978981838754",
	},
	Idle: {
		SuperSonic: "131008149186890",
		Shadow: "108826820809868",
		SuperShadow: "118249854048830",
		Default: "105352110848646",
	},
	Idle_Action_1: {
		Default: "139293564681869",
	},
	Idle_Action_2: {
		Default: "81854782755600",
	},
	Idle_Action_3: {
		Default: "129965590702269",
	},
	Idle_Action_4: {
		Default: "129909080230102",
	},
	Idle_Action_5: {
		Default: "98867330141570",
	},
	Idle_Action_6: {
		Default: "108728417837575",
	},
	Jog2: {
		SuperSonic: "102098714500260",
		Shadow: "94376630136983",
		SuperShadow: "90473305811748",
		Default: "81324249491302",
	},
	JogIntoRun: {
		SuperShadow: "96394191157454",
		Default: "84815440676414",
	},
	JumpPadLaunch: {
		SuperShadow: "140381279570718",
		Default: "101247600385290",
	},
	JumpPadStick: {
		SuperShadow: "80477230811987",
		Default: "73080808429520",
	},
	Land: {
		SuperSonic: "125530230754908",
		Shadow: "104405294217580",
		SuperShadow: "107444367333994",
		Default: "97312287771356",
	},
	LandRoll: {
		SuperShadow: "98237013229032",
		Default: "101123232860096",
	},
	LandRun: {
		SuperShadow: "91921753836266",
		Default: "98652006846113",
	},
	LandShort: {
		SuperShadow: "100441081511952",
		Default: "93740605386871",
	},
	LedgeGrabJump: {
		SuperShadow: "101816457730066",
		Default: "118662828474557",
	},
	MaxRun: {
		SuperSonic: "110608196824267",
		Shadow: "120213239659944",
		SuperShadow: "110608196824267",
		Default: "93690998175131",
	},
	Pulley: {
		SuperShadow: "127827610003926",
		Default: "112877369206861",
	},
	ReadySetGo: {
		SuperShadow: "106901567473836",
		Default: "136601519800969",
	},
	Roll: {
		Default: "97858070637548",
	},
	RollExit: {
		SuperShadow: "96126551556440",
		Default: "72179406493851",
	},
	RollToFall: {
		SuperShadow: "87157079840761",
		Default: "92656823060249",
	},
	Run: {
		SuperSonic: "85570185071834",
		Shadow: "104699873809656",
		SuperShadow: "119630957836507",
		Default: "83246255701422",
	},
	RunJet: {
		SuperSonic: "71254390295246",
		Shadow: "134216841172243",
		SuperShadow: "95057208027069",
		Default: "122207631515391",
	},
	ShadowHoming: {
		SuperShadow: "77379221068124",
		Default: "112240306187642",
	},
	SidestepL: {
		SuperShadow: "102702561244599",
		Default: "139663693111795",
	},
	SidestepR: {
		SuperShadow: "134970456885487",
		Default: "111246244102011",
	},
	Skid: {
		SuperShadow: "125202814894972",
		Default: "108533322617954",
	},
	Skydive: {
		SuperShadow: "80885896840108",
		Default: "93552861843757",
	},
	SkydiveFast: {
		SuperShadow: "112105991467333",
		Default: "76072691640147",
	},
	Slide: {
		SuperShadow: "91399583315902",
		Default: "106843760093894",
	},
	SlideToFall: {
		SuperShadow: "113394243807708",
		Default: "122740985785775",
	},
	Spindash: {
		Default: "97858070637548",
	},
	SpindashStart: {
		SuperShadow: "138049799152094",
		Default: "124723429511175",
	},
	SplitCharge: {
		SuperShadow: "138129781468941",
		Default: "136841461423615",
	},
	SpringFall: {
		SuperShadow: "108710290613508",
		Default: "137798639561758",
	},
	SpringFallRecover: {
		SuperShadow: "117539127478524",
		Default: "94969310900746",
	},
	SpringJump: {
		Shadow: "110625036608476",
		SuperShadow: "127789518351770",
		Default: "98700875586678",
	},
	Stomp: {
		SuperShadow: "137128318393191",
		Default: "109461942314833",
	},
	SuperTransformation: {
		SuperShadow: "107538327880340",
		Default: "89961947659680",
	},
	TimeTrialWin: {
		SuperShadow: "76901531666580",
		Default: "103098586385977",
	},
	TripFall: {
		SuperShadow: "70538850920429",
		Default: "137863251080481",
	},
	Walk1: {
		SuperShadow: "139894277855736",
		Default: "73615066999712",
	},
	Walk2: {
		SuperShadow: "98647423449592",
		Default: "114214606096837",
	},
	WalkFast: {
		SuperShadow: "91573752077964",
		Default: "112680865770783",
	},
	WalkStart: {
		SuperShadow: "99363747658906",
		Default: "137424310524824",
	},
	WallRun: {
		SuperShadow: "79087546217166",
		Default: "137222971516667",
	},
	Walljump: {
		SuperShadow: "118156015621765",
		Default: "75736012040543",
	},
	Zipline: {
		SuperShadow: "96553311601005",
		Default: "90671379482838",
	},
} as const satisfies {
	[Index: string]: AnimationSetData;
};
