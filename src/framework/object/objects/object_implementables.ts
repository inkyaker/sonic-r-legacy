import type { Client } from "framework";
import type { Getter } from "shared/common/types";

export interface OnTouch {
	OnTouch(Client: Client): void;
	TouchClient(Client: Client): void;
}

export interface OnTick {
	OnTick(GetClient: Getter<Client>): void;
	Tick(GetClient: Getter<Client>): void;
}

export interface OnDraw {
	OnDraw(DeltaTime: number): void;
	Draw(DeltaTime: number): void;
}

export interface OnRespawn {
	OnRespawn(): void;
	Respawn(): void;
}
