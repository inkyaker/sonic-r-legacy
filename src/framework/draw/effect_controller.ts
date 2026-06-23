import { Controller, type OnStart } from "@flamework/core";
import { ReplicatedStorage } from "@rbxts/services";
import { ClientEvents } from "framework/client_networking";
import { Workspace } from "shared/common/globals";
import type { Exclusive, RS } from "shared/common/types";

@Controller()
export class EffectController implements OnStart {
	public onStart() {
		ClientEvents.SpawnEffect.connect((Effect, Pivot) => this.SpawnEffect(Effect, Pivot));
	}

	public SpawnEffect(EffectName: Exclusive<RS["Assets"]["Effects"]>, Pivot: CFrame) {
		const Effect = ((ReplicatedStorage as RS).Assets.Effects[EffectName] as Attachment).Clone();
		Effect.Parent = Workspace.Level.Effects;
		Effect.CFrame = Pivot;

		let Lifetime = 10;
		for (const [_, Instance] of pairs(Effect.GetDescendants())) {
			if (Instance.IsA("ParticleEmitter")) {
				Instance.Emit((Instance.GetAttribute("EmitCount") as number) ?? 5);
				if (Instance.Lifetime.Max >= Lifetime) Lifetime = Instance.Lifetime.Max;
			}
		}

		task.delay(Lifetime, () => Effect.Destroy());
	}

	public ReplicateEffect(EffectName: Exclusive<RS["Assets"]["Effects"]>, Pivot: CFrame) {
		ClientEvents.SpawnEffect.fire(EffectName, Pivot);
		this.SpawnEffect(EffectName, Pivot);
	}
}
