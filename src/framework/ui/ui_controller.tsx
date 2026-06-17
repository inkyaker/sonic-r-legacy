import { Controller, type OnStart } from "@flamework/core";
// biome-ignore lint/correctness/noUnusedImports: <react>
import React, { StrictMode } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { DebugUI } from "./components/debug_ui";
import { GameUI } from "./components/game_ui";

@Controller()
export class UIController implements OnStart {
    public Root!: ReactRoblox.Root

	public onStart() {
		const PlayerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;
		const UIRoot = new Instance("ScreenGui")
        UIRoot.ResetOnSpawn = false
        UIRoot.Parent = PlayerGui

		const Root = createRoot(UIRoot);
		Root.render(<StrictMode>
            <GameUI/>
            <DebugUI/>
        </StrictMode>);
	}
}
