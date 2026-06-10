import { RunService } from "@rbxts/services";
import Net, { Route } from "@rbxts/yetanothernet";

//TODO: migrate to flamework networking

//RESPAWN
export const RespawnRoute: Route<[]> = new Route({
	Channel: "Reliable",
	Event: undefined,
});

// UPDATE
export type UpdateData = {
	// list of client arguments to replicate
	Angle: CFrame;
	Position: Vector3;
};

export type UpdatePacket = {
	Peer: string;

	Data: UpdateData;
};

export const UpdateRoute: Route<[UpdatePacket]> = new Route({
	Channel: "Reliable",
	Event: undefined,
});

// CONNECT DISCONNECT
export type ConnectDisconnectPacket = {
	Peer: string;
};

export const ConnectDisconnectRoute: Route<[ConnectDisconnectPacket]> = new Route({
	Channel: "Reliable",
	Event: undefined,
});

//TODO: add incoming middleware to all packets via t

const [Start, End] = Net.createHook({ RespawnRoute, UpdateRoute, ConnectDisconnectRoute });

RunService.Heartbeat.Connect(() => {
	Start();
	End();
});
