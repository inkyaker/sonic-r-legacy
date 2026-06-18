import { TweenService } from "@rbxts/services";
import type { Renderer } from "../renderer";
import { RenderPart } from "./render_part";

const PI = math.pi;
const TAU = PI * 2;

export class BoostAura extends RenderPart {
	public Rotation = 0;
	constructor(Renderer: Renderer, Parent: Instance) {
		super(Renderer, Parent);

		this.Model = Renderer.Assets.Boost[`${Renderer.CharacterType}Boost`].Clone();
		this.Model.Parent = Parent;

		this.SetVisible(false, true);
	}

	// always pivot bcz of the fade in/out!
	public Update(Pivot: CFrame, DeltaTime: number) {
		this.Rotation = (this.Rotation + DeltaTime * 65) % TAU;
		this.Model.PivotTo(Pivot.mul(CFrame.Angles(0, PI, this.Rotation)));
	}

	public SetVisible(Visible: boolean, Instant?: boolean) {
		if (this.Visible !== Visible) {
			this.Visible = Visible;

			for (const [_, Instance] of pairs(this.Model.GetDescendants()))
				if (Instance.IsA("BasePart")) TweenService.Create(Instance, new TweenInfo(Instant ? 0 : 0.25), { LocalTransparencyModifier: Visible ? 0.65 : 1 }).Play();
		}
	}
}
