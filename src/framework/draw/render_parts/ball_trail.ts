import { BallTrailColors } from "shared/common/globals";
import { FromToRotation } from "shared/common/utility/cfutil";
import type { Renderer } from "../renderer";
import { RenderPart } from "./render_part";

export class BallTrail extends RenderPart {
	constructor(Renderer: Renderer, Parent: Instance) {
		super(Renderer, Parent);

		this.Model = Renderer.Assets.BallTrail.Clone();
		this.Model.Parent = Parent;

		this.SetTrailColor(BallTrailColors[Renderer.CharacterType]);
		this.SetVisible(false);
	}

	public SetTrailColor(Color: Color3) {
		this.Model.GetDescendants().forEach((Instance) => {
			if (Instance.IsA("Trail")) Instance.Color = new ColorSequence(Color);
		});
	}

	public Update(Position: Vector3) {
		if (this.Visible) {
			const Pivot = this.Model.GetPivot();
			const PreviousPos = Pivot.Position;

			if (Position !== PreviousPos) {
				const Look = Pivot.LookVector;
				let Diff = Position.sub(PreviousPos).Unit;
				if (Look.Dot(Diff) < 0) {
					Diff = Diff.mul(-1);
				}

				const RotationDiff = FromToRotation(Look, Diff).mul(Pivot.Rotation);
				this.Model.PivotTo(RotationDiff.add(Position));
			}
		}
	}

	public SetVisible(Visible: boolean, CFrame?: CFrame) {
		if (this.Visible !== Visible) {
			this.Visible = Visible;

			if (this.Visible && CFrame) this.Model.PivotTo(CFrame);
			for (const [_, Instance] of pairs(this.Model.GetDescendants())) if (Instance.IsA("Trail")) Instance.Enabled = this.Visible;
		}
	}

	public Destroy() {
		this.Model.Destroy();
	}
}
