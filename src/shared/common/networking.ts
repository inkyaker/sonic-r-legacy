import { Networking } from "@flamework/networking";
import type { DataFormat } from "./data";

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
	RunEffect: Networking.Unreliable<(EffectName: string) => void>;
}

interface STCEvents {
	Update: Networking.Unreliable<(Data: UpdatePacket) => void>;
	ReplicateProfile(Data: DataFormat): void;
}

interface CTSFunctions {}

interface STCFunctions {}

export const Events = Networking.createEvent<CTSEvents, STCEvents>();
export const Functions = Networking.createFunction<CTSFunctions, STCFunctions>();
