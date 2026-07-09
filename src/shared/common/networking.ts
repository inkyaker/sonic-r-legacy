import { Networking } from "@flamework/networking";
import type { CharacterType, DataFormat } from "./data";
import type { ReformattedSettingsData } from "./settings";
import type { Exclusive, RS } from "./types";

export interface UpdatePacket {
	PeerId: number;
	Clock: number;
	Data: {
		Angle: CFrame;
		Position: Vector3;
	};
}

interface CTSEvents {
	Respawn(): void;
	Update: Networking.Unreliable<(Data: UpdatePacket) => void>;
	SpawnEffect: Networking.Unreliable<(Effect: Exclusive<RS["Assets"]["Effects"]>, Pivot: CFrame) => void>;
	UpdateSetting: (Key: keyof typeof ReformattedSettingsData, Value: unknown) => void;
	ChangeCharacter: (Character: CharacterType) => void;
}

interface STCEvents {
	Update: Networking.Unreliable<(Data: UpdatePacket) => void>;
	ReplicateProfile(Data: DataFormat): void;
	SpawnEffect: Networking.Unreliable<(Effect: Exclusive<RS["Assets"]["Effects"]>, Pivot: CFrame) => void>;
}

interface CTSFunctions {}

interface STCFunctions {}

export const Events = Networking.createEvent<CTSEvents, STCEvents>();
export const Functions = Networking.createFunction<CTSFunctions, STCFunctions>();
