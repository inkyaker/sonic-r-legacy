import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { FromToRotation } from "shared/common/utility/cfutil";
import type { Client } from "..";

const PI = math.pi;
const TAU = PI * 2;

type AssetsDir = Folder & {
	JumpBall: Model;
	BallTrail: Model;
	SpindashBall: Model;
};

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

// biome-ignore lint/correctness/noUnusedVariables: <temporary>
class SpindashBall {}

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
	public Assets: AssetsDir;
	public BallTrail;
	public JumpBall;
	public CharacterVisible: boolean = true;
	public DrawInfo: DrawInfo = PackDrawInfo();

	constructor() {
		this.Assets = ReplicatedStorage.WaitForChild("Assets").WaitForChild("Models").WaitForChild("Player") as AssetsDir;

		this.BallTrail = new BallTrail(this);
		this.JumpBall = new JumpBall(this);
	}

	/**
	 * Draw Client, should only execute at the end of each `RenderStepped`
	 */
	public Draw(Character: Model, DeltaTime: number) {
		let Angle = this.DrawInfo.Angle.mul(CFrame.Angles(0, 0, -this.DrawInfo.RailBalance));
		this.Angle = Angle.Lerp(this.Angle, (0.675 ** 60) ** DeltaTime);

		const Pivot = this.Angle.add(this.DrawInfo.Position);
		Character.PivotTo(Pivot);

		this.BallTrail.SetVisible(this.DrawInfo.BallTrailEnabled, Pivot);
		if (this.BallTrail.Visible) this.BallTrail.Update(this.DrawInfo.Position);

		this.JumpBall.SetVisible(this.DrawInfo.JumpBallEnabled, Pivot);
		if (this.JumpBall.Visible) this.JumpBall.Update(Pivot, DeltaTime, this.DrawInfo.BallRotationSpeed);

		this.SetVisible(Character, !this.JumpBall.Visible);
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
				Position: Client.RenderCFrame.Position.add(Client.Rail.RailOffset).add(Client.Angle.UpVector.mul(Client.Root.Size.Y / 2 + (Client.Humanoid.HipHeight || 0))),
				Angle: Client.RenderCFrame.Rotation,
				RailBalance: Client.Rail.RailBalance,
				JumpBallEnabled: Client.Flags.BallEnabled && Client.Animation.Current === "Roll",
				BallTrailEnabled: Client.Flags.TrailEnabled,
				BallRotationSpeed: Client.Animation.GetRate(Client) * TAU,
			}
		: {
				Position: Vector3.zero,
				Angle: CFrame.identity,
				RailBalance: 0,
				JumpBallEnabled: false,
				BallTrailEnabled: false,
				BallRotationSpeed: 0,
			};
}

export type DrawInfo = ReturnType<typeof PackDrawInfo>;
