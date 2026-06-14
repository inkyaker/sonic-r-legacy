import { ReplicatedStorage, Workspace } from "@rbxts/services";
import type { AssetsDir, RS } from "shared/common/types";
import { FromToRotation } from "shared/common/utility/cfutil";
import type { Client } from "..";

const PI = math.pi;
const TAU = PI * 2;

class JumpBall {
	public Spin: number = 0;
	public Model: Model;
	public Smear: BasePart;
	public Visible = true;

	constructor(Renderer: Renderer) {
		this.Model = Renderer.Assets.JumpBall.Clone();
		this.Model.Parent = Workspace.CurrentCamera;

		this.Smear = this.Model.WaitForChild("Smear") as BasePart;

		this.SetVisible(false);
	}

	public GetSpin() {
		return CFrame.Angles(-this.Spin, 0, 0);
	}

	public Update(Pivot: CFrame, DeltaTime: number, Speed: number) {
		this.Spin = (this.Spin + DeltaTime * Speed) % TAU;

		this.Model.PivotTo(Pivot.mul(this.GetSpin()));
		this.Smear.LocalTransparencyModifier = 1 - math.clamp((math.abs(Speed) - 20) / 50, 0, 1);
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

class BallTrail {
	public Model: Model;
	public Visible = true;

	constructor(Renderer: Renderer) {
		this.Model = Renderer.Assets.BallTrail.Clone();
		this.Model.Parent = Workspace.CurrentCamera;

		this.SetVisible(false);
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

/**
 * Client renderer
 * @class
 */
export class Renderer {
	public Angle: CFrame = CFrame.identity;
	public Position: Vector3 = Vector3.zero;
	public Assets: AssetsDir;
	public BallTrail;
	public JumpBall;
	public CharacterVisible: boolean = true;
	public DrawInfo: DrawInfo = PackDrawInfo();

	constructor() {
		this.Assets = (ReplicatedStorage as RS).Assets.Models.Player;

		this.BallTrail = new BallTrail(this);
		this.JumpBall = new JumpBall(this);
	}

	/**
	 * Draw Client, should only execute at the end of each `RenderStepped`
	 */
	public Draw(Character: Model, DeltaTime: number) {
		this.Angle = this.DrawInfo.Angle;
		this.Position = this.DrawInfo.Position;

		const Pivot = this.Angle.add(this.DrawInfo.Position.add(this.Angle.UpVector.mul(this.DrawInfo.YOffset)));
		Character.PivotTo(Pivot);

		this.BallTrail.SetVisible(this.DrawInfo.BallTrailEnabled, Pivot);
		if (this.BallTrail.Visible) this.BallTrail.Update(Pivot.Position);

		this.JumpBall.SetVisible(this.DrawInfo.JumpBallEnabled, Pivot);
		if (this.JumpBall.Visible) this.JumpBall.Update(Pivot, DeltaTime, this.DrawInfo.BallRotationSpeed);
	}

	public SetVisible(Character: Model, Visible: boolean) {
		if (this.CharacterVisible === Visible) return;
		this.CharacterVisible = Visible;

		for (const [_, Instance] of pairs(Character.GetDescendants())) if (Instance.IsA("BasePart") || Instance.IsA("Decal")) Instance.LocalTransparencyModifier = Visible ? 0 : 1;
	}

	public Destroy() {
		this.JumpBall.Destroy();
		this.BallTrail.Destroy();
	}
}

export function PackDrawInfo(Client?: Client) {
	return Client
		? {
				YOffset: Client.Root.Size.Y / 2 + (Client.Humanoid.HipHeight || 0),
				Position: Client.RenderCFrame.Position.add(Client.Rail.RailOffset),
				Angle: Client.RenderCFrame.Rotation.mul(CFrame.Angles(Client.Animation.Current === "AirBoost" ? math.clamp(Client.Speed.Y / 8, -1, 1) : 0, 0, 0)),
				JumpBallEnabled: Client.Flags.BallEnabled && Client.Animation.Current === "Roll",
				BallTrailEnabled: Client.Flags.TrailEnabled,
				BallRotationSpeed: Client.Animation.GetRate(Client) * TAU,
			}
		: {
				YOffset: 0,
				Position: Vector3.zero,
				Angle: CFrame.identity,
				JumpBallEnabled: false,
				BallTrailEnabled: false,
				BallRotationSpeed: 0,
			};
}

export type DrawInfo = ReturnType<typeof PackDrawInfo>;
