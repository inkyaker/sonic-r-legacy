import { Component } from "@flamework/components";
import { TweenService } from "@rbxts/services";
import type { Client } from "framework";
import { GetAttribute } from "shared/common/class/attributes";
import BaseObject from "../baseobj";

/**
 * @class
 * @object
 * @augments BaseObject
 */
@Component({ tag: "Ring" })
class Ring extends BaseObject<Model> {
	public Triggered: boolean = false;

	public OnTouch(Client: Client) {
		if (this.Triggered) return;
		this.Triggered = true;

		Client.Sound.Play("Object/Ring/Activate");

		Client.GameState.AddRings(1);
		Client.GameState.AddScore(10);

		this.SetTransparency(1);
	}

	public OnRespawn() {
		this.Triggered = false;
		this.SetTransparency(1);
	}

	private SetTransparency(Transparency: number) {
		for (const [_, Instance] of pairs(this.Object.GetDescendants())) {
			if (Instance.IsA("BasePart") || Instance.IsA("Decal")) {
				Instance.LocalTransparencyModifier = Transparency;
			} else if (Instance.IsA("Light")) {
				const DefaultBright = GetAttribute(Instance, "DefaultBrightness", Instance.Brightness);

				TweenService.Create(Instance, new TweenInfo(1), { Brightness: Transparency === 1 ? 0 : DefaultBright }).Play();
			}
		}

		this.Root.CanQuery = Transparency <= 0;
	}
}

export = Ring;
