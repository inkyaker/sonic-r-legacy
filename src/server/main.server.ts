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
import { Flamework, type OnStart, Service } from "@flamework/core";
import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
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
		Character.PivotTo(CFrame.identity.add(Vector3.yAxis.mul(10)));
		Character.SetAttribute("CharacterType", Type);

		Player.Character = Character;
	}
}

Flamework.addPathsGlob("src/shared/**.ts");
Flamework.addPathsGlob("src/server/**.ts");
Flamework.ignite();
