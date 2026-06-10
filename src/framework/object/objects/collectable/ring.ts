import { TweenService } from "@rbxts/services";
import type { Client } from "framework";
import { GetAttribute } from "shared/common/class/attributes";
import BaseObject from "../baseobj";

/**
 * @class
 * @object
 * @augments BaseObject
 */
class Ring extends BaseObject {
	public Triggered: boolean = false;

	protected OnTouch(Client: Client) {
		if (this.Triggered) {
			return;
		}
		this.Triggered = true;

		Client.Sound.Play("Object/Ring/Activate");

		Client.GameState.AddRings(1);
		Client.GameState.AddScore(10);

		this.SetTransparency(1);
	}

	protected OnRespawn() {
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
	}
}

export = Ring;
