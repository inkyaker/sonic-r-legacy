import { Controller, type OnStart } from "@flamework/core";
import { atom as Atom } from "@rbxts/charm";
// biome-ignore lint/correctness/noUnusedImports: <react>
import React, { StrictMode } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { FrameworkState } from "shared/common/frameworkstate";
import { DebugUI } from "./components/debug_ui";
import { GameUI } from "./components/game_ui";

@Controller()
export class UIController implements OnStart {
    public Root!: ReactRoblox.Root;

    public Rings = Atom(0);
    public Score = Atom(0);
    public Lives = FrameworkState.Lives;

    public onStart() {
        const PlayerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;
        const UIRoot = new Instance("ScreenGui");
        UIRoot.ResetOnSpawn = false;
        UIRoot.Parent = PlayerGui;

        const Root = createRoot(UIRoot);
        Root.render(
            <StrictMode>
                <GameUI RingsAtom={this.Rings} ScoreAtom={this.Score} LivesAtom={this.Lives} />
                <DebugUI />
            </StrictMode>,
        );
    }
}
