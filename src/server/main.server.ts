import { Flamework } from "@flamework/core";
import { ServerEvents } from "./server_networking";

Flamework.addPathsGlob("src/shared/**.ts");
Flamework.addPathsGlob("src/server/**.ts");
Flamework.ignite();

// TODO: dynamic character loader
ServerEvents.Respawn.connect((Player) => {
	Player.LoadCharacterAsync();
});

ServerEvents.Update.connect((Sender, Data) => ServerEvents.Update.except(Sender, Data));