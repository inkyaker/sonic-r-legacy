import type { CharacterType } from "./data";

export type Getter<T> = () => T;

export type AssetsDir = Folder & {
	Boost: Folder & {
		[K in CharacterType as `${K}Boost`]: Model;
	};
	JumpBall: Folder & {
		[K in CharacterType as `${K}JumpBall`]: Model;
	};
	BallTrail: Model;
	Effects: Model & {
		Root: Part & {
			Stomp: Attachment;
			Slide: Attachment;
			Rail: Attachment & {
				StarMain: ParticleEmitter;
				Locked: Attachment & {
					BackgroundMain: ParticleEmitter;
				};
			};
		};
	};
};

export type RS = ReplicatedStorage & {
	Assets: Folder & {
		Models: Folder & {
			Player: Folder & AssetsDir;
			Object: Folder & {
				SpilledRing: Model;
			};
		};
		Effects: Folder & {
			StompLand: Attachment;
			RingCollect: Attachment;
			FootstepGeneric: Attachment;
		};
		Animations: Folder & {
			Object: Folder & {
				Ring: Folder & {
					Spin: Animation;
				};
			};
		};
		Sounds: Folder;
		Characters: Folder & { [Index in CharacterType]: Model };
	};
};

type StandardRobloxTypes = Folder | Model | Part | Attachment | ReplicatedStorage;

export type Exclusive<T> = {
	[K in keyof T]: K extends keyof StandardRobloxTypes ? never : K extends `_nominal_${string}` ? never : K extends string ? K : never;
}[keyof T];

export interface RayParams extends RaycastParams {
	ExcludeInstances: Instance[];
	IncludeInstances: Instance[];
}
