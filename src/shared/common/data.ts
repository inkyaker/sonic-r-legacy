export const DataVersion = 2;

export const Characters = ["Sonic", "Shadow", "SuperSonic", "SuperShadow", "None"] as const;

export const DataTemplate = {
	Character: "Sonic" as CharacterType,
	DataVersion: DataVersion,

	Settings: {
		// Sound
		MusicVolume: 1,
		SFXVolume: 1,
		ObjectSFXVolume: 1,
		FootstepVolume: 1,
		OtherPlayerVolume: 1,

		// Visual
		JumpBallStyle: "New" as "New" | "Old",

		// Control
		MouseCameraSensitivity: 1,
		ControllerCameraSensitivity: 1,
		TouchCameraSensitivity: 1,
		Thumbstick1Deadzone: 0.15,
		Thumbstick2Deadzone: 0.15,

		// Gameplay
	},
};

export type CharacterType = (typeof Characters)[number];

export type DataFormat = typeof DataTemplate;
