import { ReplicatedStorage } from "@rbxts/services";
import { Workspace } from "shared/common/globals";
import type { AssetsDir, RS } from "shared/common/types";
import type { Client } from "..";
import { BallTrail } from "./render_parts/ball_trail";
import { JumpBall } from "./render_parts/jump_ball";

const PI = math.pi;
const TAU = PI * 2;

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
	public ModelParent: Model;

	constructor() {
		this.Assets = (ReplicatedStorage as RS).Assets.Models.Player;

		this.ModelParent = new Instance("Model");
		this.ModelParent.Name = `DrawModels`;
		this.ModelParent.Parent = Workspace.CurrentCamera!;

		this.BallTrail = new BallTrail(this, this.ModelParent);
		this.JumpBall = new JumpBall(this, this.ModelParent);
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
