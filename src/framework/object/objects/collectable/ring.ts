import { TweenService } from "@rbxts/services";
import type { DSClient } from "framework";
import { GetAttribute } from "shared/common/class/attributes";
import SrcObject from "../baseobj";

/**
 * @class
 * @object
 * @augments SrcObject
 */
class Ring extends SrcObject {
	public Triggered: boolean = false;

	protected OnTouch(Client: DSClient) {
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
