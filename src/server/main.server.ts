import { Flamework, type OnStart, Service } from "@flamework/core";
import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import type { CharacterType } from "shared/common/data";
import { workspace } from "shared/common/globals";
import type { RS } from "shared/common/types";
import type { DataProfile, DataService } from "./data_service";
import { ServerEvents } from "./server_networking";

@Service()
export class ServerService implements OnStart {
	public Replicated = ReplicatedStorage as RS;

	constructor(public Data: DataService) {}

	public onStart() {
		ServerEvents.Respawn.connect((Player) => this.SpawnCharacter(Player));

		ServerEvents.Update.connect((Sender, Data) => ServerEvents.Update.except(Sender, Data));
		ServerEvents.SpawnEffect.connect((Sender, Effect, Pivot) => ServerEvents.SpawnEffect.except(Sender, Effect, Pivot));

		Players.PlayerAdded.Connect((Player) => {
			let Profile: DataProfile;
			while (!((Profile = this.Data.Profiles[Player.UserId]!) || !Player.IsDescendantOf(Players))) task.wait(0.1);
			if (!Player.IsDescendantOf(Players)) return;

			this.SpawnCharacter(Player);
		});
	}

	public SpawnCharacter(Player: Player) {
		const Profile = this.Data.Profiles[Player.UserId];
		if (!Profile) return;

		const Type = Profile.Data.Character;

		if (Player.Character) {
			const Character = Player.Character;
			Player.Character = undefined;
			Character.Destroy();
		}

		const Character = this.Replicated.Assets.Characters[Type].Clone();
		Character.Name = Player.Name;
		Character.Parent = Workspace;
		Character.PivotTo(this.GetSpawnLocation(Type));
		Character.SetAttribute("CharacterType", Type);

		Player.Character = Character;
	}

	public GetSpawnLocation(Type: CharacterType) {
		const Spawn = workspace.Level.Spawns[Type] ?? workspace.Level.Spawns.Default;
		
		return Spawn.CFrame;
	}
}

Flamework.addPathsGlob("src/shared/common/**.ts");
Flamework.addPaths("src/shared/loader.server.ts")
Flamework.addPathsGlob("src/server/**.ts");
Flamework.ignite();
