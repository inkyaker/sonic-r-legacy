import type { AssetsDir, Exclusive } from "shared/common/types";
import type { DrawInfo, Renderer } from "../renderer";
import { RenderPart } from "./render_part";

export class Effects extends RenderPart {
	public Bindings: {
		EffectName: Exclusive<AssetsDir["Effects"]["Root"]>;
		DrawInfoName: keyof DrawInfo;
		Enabled: boolean;
		StateChangeCallback?: (State: boolean) => void;
	}[] = [];

	constructor(Renderer: Renderer, Parent: Instance) {
		super(Renderer, Parent);

		this.Model = Renderer.Assets.Effects.Clone();
		this.Model.Parent = Parent;

		this.CreateBinding("Stomp", "StompEnabled");
		this.CreateBinding("Slide", "SlideEnabled");
		this.CreateBinding("Rail", "RailEffectEnabled", (State) => {
			const Model = this.Model as AssetsDir["Effects"];
			Model.Root.Rail.Locked.BackgroundMain.LockedToPart = State;
			if (!State) Model.Root.Rail.StarMain.Clear();
		});
	}

	public CreateBinding(EffectName: Exclusive<AssetsDir["Effects"]["Root"]>, DrawInfoName: keyof DrawInfo, StateChangeCallback?: (State: boolean) => void) {
		this.Bindings.push({
			EffectName: EffectName,
			DrawInfoName: DrawInfoName,
			Enabled: false,
			StateChangeCallback: StateChangeCallback,
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
				Binding.StateChangeCallback?.(Enabled);
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
