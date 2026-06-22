export const DataVersion = 2;

export const Characters = ["Sonic", "Shadow", "SuperSonic", "SuperShadow", "None"] as const;

export const DataTemplate = {
	Character: "Sonic" as CharacterType,
	DataVersion: DataVersion,

	Settings: {
		MusicVolume: 1,
		SFXVolume: 1,
		ObjectSFXVolume: 1,
		FootstepVolume: 1,
		OtherPlayerVolume: 1,
	},
};

export type CharacterType = (typeof Characters)[number];

export type DataFormat = typeof DataTemplate;
