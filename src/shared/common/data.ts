import { ReformattedSettingsData } from "./settings";

export const DataVersion = 3;

export const Characters = ["Sonic", "Shadow", "SuperSonic", "SuperShadow", "None"] as const;

export const DataTemplate = {
	Character: "Sonic" as CharacterType,
	DataVersion: DataVersion,

	Settings: ReformattedSettingsData,
};

export type CharacterType = (typeof Characters)[number];

export type DataFormat = typeof DataTemplate;
