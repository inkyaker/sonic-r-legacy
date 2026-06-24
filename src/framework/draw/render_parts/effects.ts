import type { AssetsDir, Exclusive } from "shared/common/types";
import type { DrawInfo, Renderer } from "../renderer";
import { RenderPart } from "./render_part";

export class Effects extends RenderPart {
	public Bindings: {
		EffectName: Exclusive<AssetsDir["Effects"]["Root"]>;
		DrawInfoName: keyof DrawInfo;
		Enabled: boolean;
	}[] = [];

	constructor(Renderer: Renderer, Parent: Instance) {
		super(Renderer, Parent);

		this.Model = Renderer.Assets.Effects.Clone();
		this.Model.Parent = Parent;

		this.CreateBinding("Stomp", "StompEnabled")
		this.CreateBinding("Slide", "SlideEnabled")
		this.CreateBinding("Rail", "RailEffectEnabled")
	}

	public CreateBinding(EffectName: Exclusive<AssetsDir["Effects"]["Root"]>, DrawInfoName: keyof DrawInfo) {
		this.Bindings.push({
			EffectName: EffectName,
			DrawInfoName: DrawInfoName,
			Enabled: false,
		});
	}

	public Update(Pivot: CFrame) {
		this.Model.PivotTo(Pivot);
	}

	public UpdateEffects(DrawInfo: DrawInfo) {
		for (const [_, Binding] of pairs(this.Bindings)) {
			const Enabled = !!DrawInfo[Binding.DrawInfoName];
			if (Binding.Enabled !== Enabled) {
				Binding.Enabled = Enabled;
				this.SetGroupEnabled(Binding.EffectName, Enabled);
			}
		}
	}

	public SetGroupEnabled(Group: Exclusive<AssetsDir["Effects"]["Root"]>, Enabled: boolean) {
		for (const [_, Part] of pairs(((this.Model as AssetsDir["Effects"]).Root[Group] as Instance).GetDescendants())) {
			if (Part.IsA("ParticleEmitter")) Part.Enabled = Enabled;
		}
	}
}
