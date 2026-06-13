import type { CharacterType } from "./data";

export type Getter<T> = () => T;

export type AssetsDir = Folder & {
	JumpBall: Model;
	BallTrail: Model;
	SpindashBall: Model;
};

export type RS = ReplicatedStorage & {
	Assets: Folder & {
		Models: Folder & {
			Player: Folder & AssetsDir;
		};
		Sounds: Folder;
		Characters: Folder & { [Index in CharacterType]: Model };
	};
};
