import type { Renderer } from "../renderer";
import { RenderPart } from "./render_part";

const PI = math.pi;
const TAU = PI * 2;

export class JumpBall extends RenderPart {
	public Spin: number = 0;
	public Smear: BasePart;

	constructor(Renderer: Renderer, Parent: Instance) {
		super(Renderer, Parent);

		this.Model = Renderer.Assets.JumpBall.Clone();
		this.Model.Parent = Parent;

		this.Smear = this.Model.WaitForChild("Smear") as BasePart;

		this.SetVisible(false);
	}

	public GetSpin() {
		return CFrame.Angles(-this.Spin, 0, 0);
	}

	public Update(Pivot: CFrame, DeltaTime: number, Speed: number) {
		if (this.Visible) {
			this.Spin = (this.Spin + DeltaTime * Speed) % TAU;

			this.Model.PivotTo(Pivot.mul(this.GetSpin()));
			this.Smear.LocalTransparencyModifier = 1 - math.clamp((math.abs(Speed) - 20) / 50, 0, 1);
		}
	}

	public SetVisible(Visible: boolean, CFrame?: CFrame) {
		if (this.Visible !== Visible) {
			this.Visible = Visible;

			if (this.Visible && CFrame) {
				this.Model.PivotTo(CFrame.mul(this.GetSpin()));
			}

			for (const [_, Instance] of pairs(this.Model.GetDescendants())) if (Instance.IsA("BasePart")) Instance.LocalTransparencyModifier = this.Visible ? 0 : 1;
		}
	}

	public Destroy() {
		this.Model.Destroy();
	}
}
