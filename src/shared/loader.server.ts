/*
    Copyright 2026 nadia8666

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
import type { Components } from "@flamework/components";
import { Controller, Flamework, type OnStart } from "@flamework/core";
import { GuiService, Players } from "@rbxts/services";
import type { Client } from "framework";
import type { PlayerReplicator } from "framework/draw/replication";
import type { ObjectController } from "framework/object/object_controller";

// TODO: loading screen
if (!game.IsLoaded()) {
	game.Loaded.Wait();
}

GuiService.SetGameplayPausedNotificationEnabled(false);

@Controller()
export class GameController implements OnStart {
	public LocalPlayer = Players.LocalPlayer;
	public ActiveClient: Client | undefined;

	constructor(
		public Replicator: PlayerReplicator,
		public Components: Components,
		public Object: ObjectController,
	) {}

	public onStart() {
		if (this.LocalPlayer.Character) this.ActiveClient = this.Components.addComponent<Client>(this.LocalPlayer.Character!);

		this.LocalPlayer.CharacterAdded.Connect((Character) => (this.ActiveClient = this.Components.addComponent<Client>(Character)));

		this.LocalPlayer.CharacterRemoving.Connect(() => {
			this.ActiveClient?.Destroy();
			this.ActiveClient = undefined;
		});
	}
}

Flamework.addPathsGlob("src/shared/**.ts");
Flamework.addPathsGlob("src/framework/**.ts");
Flamework.ignite();
