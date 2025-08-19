import { Players, RunService } from "@rbxts/services"
import Net, { Route } from "@rbxts/yetanothernet"
import * as Routes from "shared/common/replication/routes"

const ReplicationRemote:Route<Routes.UpdateRoute> = Routes.UpdateRoute

RunService.Heartbeat.Connect(() => {
    for (const [Index, Sender, Packet] of ReplicationRemote.query()) {
        if (typeIs(Sender, "string")) { continue }

        const PlayerList = Players.GetPlayers()

        for (const [_, Player] of pairs(Players.GetPlayers())) {
            if (Player !== Sender) {
                ReplicationRemote.send(Packet).to(Player)
            }
        }
    }
})