import type { Renderer } from "../renderer";
import { RenderPart } from "./render_part";

const PI = math.pi;
const TAU = PI * 2;

export class JumpBall extends RenderPart {
	public Spin: number = 0;

	constructor(Renderer: Renderer, Parent: Instance) {
		super(Renderer, Parent);

		this.Model = Renderer.Assets.JumpBall[`${Renderer.CharacterType}JumpBall`].Clone();
		this.Model.Parent = Parent;

		this.SetVisible(false);
	}

	public GetSpin() {
		return CFrame.Angles(-this.Spin, PI, 0);
	}

	public Update(Pivot: CFrame, DeltaTime: number, Speed: number) {
		if (this.Visible) {
			this.Spin = (this.Spin + DeltaTime * Speed) % TAU;

			this.Model.PivotTo(Pivot.mul(this.GetSpin()));
		}
	}

	public SetVisible(Visible: boolean, CFrame?: CFrame) {
		if (this.Visible !== Visible) {
			this.Visible = Visible;

			if (this.Visible && CFrame) this.Model.PivotTo(CFrame.mul(this.GetSpin()));

			for (const [_, Instance] of pairs(this.Model.GetDescendants()))
				if (Instance.IsA("BasePart")) Instance.LocalTransparencyModifier = this.Visible ? .15 : 1;
				else if (Instance.IsA("ParticleEmitter")) {
					Visible ? Instance.Emit(2) : Instance.Clear();
					Instance.Enabled = Visible;
				}
		}
	}

	public Destroy() {
		this.Model.Destroy();
	}
}
