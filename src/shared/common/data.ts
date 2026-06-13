export const DataVersion = 1;

export const Characters = ["Sonic", "Shadow", "SuperSonic", "SuperShadow"] as const;

export const DataTemplate = {
	Character: "Sonic" as CharacterType,
	DataVersion: DataVersion,
};

export type CharacterType = typeof Characters[number];

export type DataFormat = typeof DataTemplate;
