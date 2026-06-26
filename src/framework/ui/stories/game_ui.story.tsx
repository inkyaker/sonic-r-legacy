import { atom } from "@rbxts/charm";
import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { EnumList, type InferProps } from "@rbxts/ui-labs";
import type { CharacterType } from "shared/common/data";
import { GameUI } from "../components/game_ui";
import type { InputPopup } from "../ui_controller";

const controls = {
	Character: EnumList(
		{
			Sonic: "Sonic",
			None: "None",
			Shadow: "Shadow",
			SuperSonic: "SuperSonic",
			SuperShadow: "SuperShadow",
		},
		"None",
	),
};

const Atoms = [atom(1), atom(5), atom(6000), atom<CharacterType>("None"), atom<InputPopup | undefined>({
	Data: {
		Image: `rbxthumb://type=Asset&id=84933085329465&w=150&h=150`,
		Text: "BOOST"
	},
	Duration: 3
})] as const;
const Story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls: controls,
	story: (props: InferProps<typeof controls>) => {
		useEffect(() => {
			Atoms[3](props.controls.Character);
		}, [props.controls.Character]);

		return <GameUI CharacterTypeAtom={Atoms[3]} RingsAtom={Atoms[0]} LivesAtom={Atoms[1]} ScoreAtom={Atoms[2]} MultAtom={Atoms[0]} PopupAtom={Atoms[4]} />;
	},
};

export = Story;
