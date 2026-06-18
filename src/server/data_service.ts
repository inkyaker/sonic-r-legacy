import { type OnStart, Service } from "@flamework/core";
import { type Profile, ProfileStore } from "@rbxts/profilestore";
import { Players } from "@rbxts/services";
import { type DataFormat, DataTemplate, DataVersion } from "shared/common/data";
import { ServerEvents } from "./server_networking";

function Key(Player: Player) {
	return `${Player.UserId}`;
}

const Migrations: Record<number, (Profile: DataProfile) => void> = {};

export type DataProfile = Profile<string, DataFormat, DataService["Store"]>;

@Service()
export class DataService implements OnStart {
	public Profiles: Record<number, DataProfile> = {};
	public Store = new ProfileStore("PlayerData", DataTemplate);

	public onStart() {
		Players.PlayerAdded.Connect((Player) => this.PlayerAdded(Player));
		Players.PlayerRemoving.Connect((Player) => this.PlayerRemoving(Player));
		Players.GetPlayers().forEach((Player) => task.spawn(() => this.PlayerAdded(Player)));
	}

	public PlayerAdded(Player: Player) {
		const Profile = this.Store.StartSessionAsync(Key(Player), {
			Cancel: () => !Player.IsDescendantOf(Players),
		});

		if (!Profile) {
			Player.Kick("Data failed to load\nCode: 000A");
			return;
		}

		Profile.AddUserId(Player.UserId);
		Profile.Reconcile();

		Profile.OnSessionEnd.Connect(() => {
			delete this.Profiles[Player.UserId];
			Player.Kick("Game session ended\nCode: 000B");
		});

		if (Player.IsDescendantOf(Players)) {
			this.MigrateData(Profile);

			this.Profiles[Player.UserId] = Profile;
			this.ReplicateProfile(Player);
		} else Profile.EndSession();
	}

	public ReplicateProfile(Player: Player) {
		const Profile = this.Profiles[Player.UserId];
		if (!Profile) return;

		ServerEvents.ReplicateProfile(Player, Profile.Data);
	}

	public PlayerRemoving(Player: Player) {
		this.Profiles[Player.UserId]?.EndSession();
		delete this.Profiles[Player.UserId];
	}

	public MigrateData(Profile: DataProfile) {
		for (const NextVersion of $range(Profile.Data.DataVersion, DataVersion - 1)) {
			Migrations[NextVersion]?.(Profile);
			Profile.Data.DataVersion = NextVersion + 1;
		}
	}
}
