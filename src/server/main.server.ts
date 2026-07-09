import { Flamework, type OnStart, Service } from "@flamework/core";
import Konsole from "@kyrorblx/konsole";
import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import type { CharacterType } from "shared/common/data";
import { SoundService, workspace } from "shared/common/globals";
import type { RS } from "shared/common/types";
import type { DataProfile, DataService } from "./data_service";
import { ServerEvents } from "./server_networking";

@Service()
export class ServerService implements OnStart {
	public Replicated = ReplicatedStorage as RS;

	constructor(public Data: DataService) {}

	public onStart() {
		SoundService.GetChildren()
			.filter((v) => v.IsA("SoundGroup"))
			.forEach((v) => (v.Volume = 0));

		ServerEvents.Respawn.connect((Player) => this.SpawnCharacter(Player));

		ServerEvents.Update.connect((Sender, Data) => ServerEvents.Update.except(Sender, Data));
		ServerEvents.SpawnEffect.connect((Sender, Effect, Pivot) => ServerEvents.SpawnEffect.except(Sender, Effect, Pivot));

		ServerEvents.UpdateSetting.connect((Player, Key, Value) => {
			let Profile: DataProfile;
			while (!((Profile = this.Data.Profiles[Player.UserId]!) || !Player.IsDescendantOf(Players))) task.wait(0.1);
			if (!Player.IsDescendantOf(Players)) return;

			const Current = Profile.Data.Settings[Key];
			if (typeOf(Current) === typeOf(Value)) {
				Profile.Data.Settings[Key] = Value as never;
				this.Data.ReplicateProfile(Player);
			}
		});

		ServerEvents.ChangeCharacter.connect((Player, Character) => {
			let Profile: DataProfile;
			while (!((Profile = this.Data.Profiles[Player.UserId]!) || !Player.IsDescendantOf(Players))) task.wait(0.1);
			if (!Player.IsDescendantOf(Players)) return;

			Profile.Data.Character = Character;
			this.Data.ReplicateProfile(Player);

			this.SpawnCharacter(Player);
		});

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
Flamework.addPaths("src/shared/loader.server.ts");
Flamework.addPathsGlob("src/server/**.ts");
Flamework.ignite();

Konsole.host();

Konsole.define({
	name: "getrank",
	rank: 0,
	aliases: ["rankof"],
	description: "get the rank of selected players",
	server: "getRankServer",
	args: [
		{
			name: "target",
			type: "players",
			required: true,
		},
	],
});

Konsole.implement("getRankServer", (Context, Players) => {
	let Output = "Player Ranks:";
	(Players as Player[]).forEach((Player) => (Output = `${Output}\n${Player.DisplayName} (@${Player.Name}): ${Konsole.getRank(Player)}`));

	return Context.reply(Output);
});
