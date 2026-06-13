import { type OnStart, Service } from "@flamework/core";
import { type Profile, ProfileStore } from "@rbxts/profilestore";
import { Players } from "@rbxts/services";
import { type DataFormat, DataTemplate, DataVersion } from "shared/common/data";

function Key(Player: Player) {
	return `${Player.UserId}`;
}

const Migrations: Record<number, (Profile: DataProfile) => void> = {};

export type DataProfile = Profile<string, DataFormat, DataService["Store"]>;

@Service()
export class DataService implements OnStart {
	public Profiles = new Map<Player, DataProfile>();
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
			this.Profiles.delete(Player);
			Player.Kick("Game session ended\nCode: 000B");
		});

		if (Player.IsDescendantOf(Players)) {
			this.MigrateData(Profile);

			this.Profiles.set(Player, Profile);
		} else Profile.EndSession();
	}

	public PlayerRemoving(Player: Player) {
		this.Profiles.get(Player)?.EndSession();
		this.Profiles.delete(Player);
	}

	public MigrateData(Profile: DataProfile) {
		for (const NextVersion of $range(Profile.Data.DataVersion, DataVersion - 1)) {
			Migrations[NextVersion]?.(Profile);
			Profile.Data.DataVersion = NextVersion + 1;
		}
	}
}
