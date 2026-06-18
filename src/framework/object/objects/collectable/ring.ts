import { Component } from "@flamework/components";
import { TweenService } from "@rbxts/services";
import type { Client } from "framework";
import { GetAttribute } from "shared/common/class/attributes";
import BaseObject from "../baseobj";
import { ObjectState } from "../object_state";

/**
 * @class
 * @object
 * @augments BaseObject
 */
@Component({ tag: "Ring" })
class Ring extends BaseObject<Model> {
	public State = new ObjectState(["Uncollected", "Collected"]);

	public OnStart(Data?: unknown) {
		this.Connections.Add(this.State.On("Uncollected").Connect(() => this.SetTransparency(0)));
		this.Connections.Add(this.State.On("Collected").Connect(() => this.SetTransparency(1)));

		if (Data) this.Deserialize(Data);
		else this.State.Set("Uncollected");
	}

	public OnTouch(Client: Client) {
		if (this.State.Is("Collected")) return;
		this.State.Set("Collected");

		Client.Sound.Play("Object/Ring/Activate");
		Client.GameState.AddRings(1);
		Client.GameState.AddScore(10);
	}

	public OnRespawn() {
		this.State.Set("Uncollected");
	}

	public OnStreamOut() {
		this.Connections.Disconnect();
		this.State.Destroy();
	}

	private SetTransparency(Transparency: number) {
		for (const [_, Instance] of pairs(this.Object.GetDescendants())) {
			if (Instance.IsA("BasePart") || Instance.IsA("Decal")) Instance.LocalTransparencyModifier = Transparency;
			else if (Instance.IsA("Light")) {
				const DefaultBright = GetAttribute(Instance, "DefaultBrightness", Instance.Brightness);

				TweenService.Create(Instance, new TweenInfo(1), { Brightness: Transparency === 1 ? 0 : DefaultBright }).Play();
			}
		}

		this.Root.CanQuery = Transparency <= 0;
	}

	public Serialize(): unknown {
		return this.State.Serialize();
	}

	public Deserialize(Data: unknown) {
		this.State.Deserialize(Data);
	}
}

export = Ring;
