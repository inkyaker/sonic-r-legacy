import { Controller, type OnStart } from "@flamework/core";
import { atom as Atom } from "@rbxts/charm";
// biome-ignore lint/correctness/noUnusedImports: <react>
import React, { StrictMode } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import { GuiService, Players } from "@rbxts/services";
import type BaseObject from "framework/object/objects/baseobj";
import type { CharacterType } from "shared/common/data";
import { DebugUI } from "./components/debug_ui";
import { GameUI } from "./components/game_ui";

export interface InputPopup {
	Data: { Text: string; Image: string };
	Duration: number;
}

@Controller()
export class UIController implements OnStart {
	public Root!: ReactRoblox.Root;

	public Rings = Atom(0);
	public Score = Atom(0);
	public ScoreMult = Atom(1);
	public CharacterType = Atom<CharacterType>("None");
	public InputPopupAtom = Atom<InputPopup | undefined>(undefined);
	public HomingObject = Atom<BaseObject<Model> | undefined>(undefined, (Prev, New) => {
		return Prev?.attributes.UniqueID === New?.attributes.UniqueID;
	});

	public onStart() {
		const PlayerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;
		const UIRoot = new Instance("ScreenGui");
		UIRoot.ResetOnSpawn = false;
		UIRoot.Parent = PlayerGui;
		UIRoot.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;

		const Root = createRoot(UIRoot);
		Root.render(
			<StrictMode>
				<GameUI
					CharacterTypeAtom={this.CharacterType}
					RingsAtom={this.Rings}
					ScoreAtom={this.Score}
					MultAtom={this.ScoreMult}
					PopupAtom={this.InputPopupAtom}
					HomingObjectAtom={this.HomingObject}
				/>
				<DebugUI />
			</StrictMode>,
		);

		GuiService.AutoSelectGuiEnabled = false;
		GuiService.GuiNavigationEnabled = false;
	}
}
