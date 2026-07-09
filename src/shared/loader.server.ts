import type { Components } from "@flamework/components";
import { Controller, Flamework, type OnStart } from "@flamework/core";
import Konsole from "@kyrorblx/konsole";
import { GuiService, Players, StarterGui } from "@rbxts/services";
import type { Client } from "framework";
import { ClientEvents } from "framework/client_networking";
import type { PlayerReplicator } from "framework/draw/replication";
import type { ObjectController } from "framework/object/object_controller";

// TODO: loading screen
if (!game.IsLoaded()) game.Loaded.Wait();

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

Flamework.addPathsGlob("src/shared/common/**.ts");
Flamework.addPaths("src/shared/loader.server.ts");
Flamework.addPathsGlob("src/framework/**.ts");
Flamework.ignite();

const Event = new Instance("BindableEvent");
Event.Event.Connect(() => ClientEvents.Respawn());

task.spawn(() => {
	let Success = false;
	while (!Success) {
		Success = pcall(() => StarterGui.SetCore("ResetButtonCallback", Event))[0];

		if (!Success) task.wait(0.15);
	}
});

Konsole.hide();
Konsole.setEnabled(true);
Konsole.setActivationKeys([Enum.KeyCode.Semicolon]);
