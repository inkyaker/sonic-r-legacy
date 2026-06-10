import { Flamework } from "@flamework/core";
import { Players, RunService } from "@rbxts/services";
import * as Routes from "shared/common/replication/routes";

Flamework.addPathsGlob("src/shared/**.ts");
Flamework.addPathsGlob("src/server/**.ts");
Flamework.ignite();

RunService.Heartbeat.Connect(() => {
	/*
    for (const [_, Sender, Packet] of UpdateRoute.query()) {
        if (typeIs(Sender, "string")) { continue }

        const PlayerList = Players.GetPlayers()

        for (const [_, Player] of pairs(Players.GetPlayers())) {
            if (Player !== Sender) {
                UpdateRoute.send(Packet).to(Player)
            }
        }
    } 
    */

	for (const [_, Sender] of Routes.RespawnRoute.query().server()) {
		print("hello im route");

		if (Sender && Sender.Parent === Players) {
			print("hello im load");
			Sender.LoadCharacter();
		}
	}
});
