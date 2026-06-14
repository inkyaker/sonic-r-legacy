import { Controller, type OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import { Trash } from "@rbxts/trash";
import { ClientEvents } from "framework/client_networking";
import type { UpdatePacket } from "shared/common/networking";
import { type DrawInfo, PackDrawInfo, Renderer } from "./renderer";

/**
 * Replication peer
 * @class
 */
export class Peer {
	public DrawInfo: DrawInfo = PackDrawInfo(undefined);
	public Renderer: Renderer;
	public Character: Model | undefined;
	public Bin = new Trash();

	constructor(
		public PeerId: number,
		InitialData: UpdatePacket["Data"],
	) {
		const Player = Players.GetPlayerByUserId(PeerId);
		if (Player) {
			this.Bin.add(Player.CharacterAdded.Connect((Character) => this.CharacterAdded(Character)));
			this.Bin.add(Player.CharacterRemoving.Connect(() => this.CharacterRemoving()));
		} else error(`Failed to find player for peer id ${PeerId}!`);

		this.Renderer = new Renderer();
		this.Update(InitialData);
		this.Renderer.DrawInfo = this.DrawInfo;
	}

	public CharacterAdded(Character: Model) {
		this.Character = Character;
	}

	public CharacterRemoving() {
		this.Character = undefined;
	}

	public Update(Data: UpdatePacket["Data"]) {
		for (const [Index, Value] of pairs(Data)) this.DrawInfo[Index] = Value as never;
	}

	public Draw(DeltaTime: number) {
		if (!this.Character) return;

		this.Renderer.DrawInfo = this.DrawInfo;
		this.Renderer.Draw(this.Character, DeltaTime);
	}

	public Destroy() {
		this.Bin.destroy();
		this.CharacterRemoving();
		this.Renderer.Destroy();
	}
}

/**
 * Replicator
 * @class
 */
@Controller()
export class PlayerReplicator implements OnStart {
	public Peers: Map<number, Peer> = new Map();

	public onStart() {
		this.SetupConnections();
	}

	public ReplicateSelf(DrawInfo: DrawInfo) {
		ClientEvents.Update({
			PeerId: Players.LocalPlayer.UserId,
			Data: DrawInfo,
			Clock: os.clock(),
		});
	}

	public SetupConnections() {
		ClientEvents.Update.connect((Data) => this.Peers.get(Data.PeerId)?.Update(Data.Data));

		Players.PlayerAdded.Connect((Player) => this.AddPeer(Player));
		Players.GetPlayers().forEach((Player) => task.spawn(() => this.AddPeer(Player)));

		Players.PlayerRemoving.Connect((Player) => this.RemovePeer(Player.UserId));
	}

	public AddPeer(TargetPlayer: Player) {
		if (TargetPlayer === Players.LocalPlayer) return;

		const NewPeer = new Peer(TargetPlayer.UserId, {
			Angle: new CFrame(),
			Position: new Vector3(),
		});

		this.Peers.set(TargetPlayer.UserId, NewPeer);
	}

	public RemovePeer(PeerId: number) {
		this.Peers.get(PeerId)?.Destroy();
		this.Peers.delete(PeerId);
	}

	public Draw(DeltaTime: number) {
		this.Peers.forEach((Peer) => task.spawn(() => Peer.Draw(DeltaTime)));
	}

	public Destroy() {
		this.Peers.forEach((Peer) => Peer.Destroy());
		this.Peers.clear();
	}
}
