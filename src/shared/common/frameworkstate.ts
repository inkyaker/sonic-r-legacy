const GameSpeedModifiers: Record<
	string,
	{
		Speed: number;
		Weight: number;
	}
> = {};
export let FrameworkState = {
	GameSpeed: 1,
};

function UpdateGameSpeed() {
	let [Speed, MaxWeight] = [1, -999];
	for (const [_, Modifier] of pairs(GameSpeedModifiers)) {
		if (Modifier.Weight > MaxWeight) {
			Speed = Modifier.Speed;
			MaxWeight = Modifier.Weight;
		}
	}

	FrameworkState.GameSpeed = Speed;
}

export function ResetGameSpeed() {
	for (const [Name, _Modifier] of pairs(GameSpeedModifiers)) {
		if (Name !== "Pause") delete GameSpeedModifiers[Name];
	}
	UpdateGameSpeed();
}

export function SetGameSpeed(Speed: number) {
	GameSpeedModifiers.SpeedSet = {
		Speed: Speed,
		Weight: 100,
	};
	UpdateGameSpeed();
}

export function AddGameSpeedModifier(Speed: number, Weight: number, Name: string) {
	GameSpeedModifiers[Name] = { Speed: Speed, Weight: Weight };
	UpdateGameSpeed();
}

export function RemoveGameSpeedModifier(Name: string) {
	delete GameSpeedModifiers[Name];
	UpdateGameSpeed();
}
