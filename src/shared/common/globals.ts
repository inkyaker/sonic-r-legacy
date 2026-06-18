import { SoundService as Sounds, Workspace as workspace } from "@rbxts/services";

export const Workspace = workspace as Workspace & {
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
	CharacterSFX: SoundGroup,
	Music: SoundGroup,
	ObjectSFX: SoundGroup,
	
}