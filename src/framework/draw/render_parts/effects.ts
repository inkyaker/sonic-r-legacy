import type { AssetsDir } from "shared/common/types";
import type { DrawInfo, Renderer } from "../renderer";
import { RenderPart } from "./render_part";

export class Effects extends RenderPart {
	public StompEnabled = false;
	public SlideEnabled = false;

	constructor(Renderer: Renderer, Parent: Instance) {
		super(Renderer, Parent);

		this.Model = Renderer.Assets.Effects.Clone();
		this.Model.Parent = Parent;
	}

	public Update(Pivot: CFrame) {
		this.Model.PivotTo(Pivot);
	}

	public UpdateEffects(DrawInfo: DrawInfo) {
		if (DrawInfo.StompEnabled !== this.StompEnabled) {
			this.StompEnabled = DrawInfo.StompEnabled;
			this.SetGroupEnabled("Stomp", this.StompEnabled);
		}
	}

	public SetGroupEnabled(Group: keyof AssetsDir["Effects"]["Root"], Enabled: boolean) {
		for (const [_, Part] of pairs(((this.Model as AssetsDir["Effects"]).Root[Group] as Instance).GetDescendants())) {
			if (Part.IsA("ParticleEmitter")) Part.Enabled = Enabled;
		}
	}
}
