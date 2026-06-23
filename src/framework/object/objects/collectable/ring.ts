import { Component } from "@flamework/components";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import type { Client } from "framework";
import { CollisionParams } from "framework/physics/collision";
import { Constants } from "shared/common/constants";
import { workspace } from "shared/common/globals";
import type { RS } from "shared/common/types";
import { PlaneProject } from "shared/common/utility/vutil";
import BaseObject from "../baseobj";
import { ObjectState } from "../object_state";

//TODO: destroyign objects like this technically introduces a memory leak so differentiating between object unload and object destroy will be required to fix.

const TwoSeconds = 2 * Constants.Tickrate;

/**
 * @class
 * @object
 * @augments BaseObject
 */
@Component({ tag: "Ring" })
class Ring extends BaseObject<
	Model & {
		ObjectModel: Model & {
			Ring: BasePart;
			AnimationController: AnimationController & {
				Animator: Animator;
			};
		};
	}
> {
	public Lifetime = 0;
	public TimeAlive = 0;
	public Velocity = Vector3.zero;
	public State = new ObjectState(["Uncollected", "Collected"]);
	public Animation!: AnimationTrack;

	public OnStart(Data?: unknown) {
		this.Connections.Add(this.State.On("Uncollected").Connect(() => this.SetTransparency(0)));
		this.Connections.Add(this.State.On("Collected").Connect(() => this.SetTransparency(1)));

		if (Data) this.Deserialize(Data);
		else this.State.Set("Uncollected");

		if (this.instance.GetAttribute("Lifetime")) this.Lifetime = this.instance.GetAttribute("Lifetime") as number;

		this.Velocity = this.Root.AssemblyLinearVelocity;
		this.Root.AssemblyLinearVelocity = Vector3.zero;

		this.Animation = this.instance.ObjectModel.AnimationController.Animator.LoadAnimation((ReplicatedStorage as RS).Assets.Animations.Object.Ring.Spin);
		this.Animation.Play();
	}

	public OnTouch(Client: Client) {
		if (this.State.Is("Collected") || (this.Lifetime > 0 && this.TimeAlive <= 60)) return;
		this.State.Set("Collected");

		Client.Sound.Play("Object/Ring/Activate");
		Client.GameState.AddRings(1);
		Client.GameState.AddScore(10);
		Client.Effects.ReplicateEffect("RingCollect", this.Root.CFrame);

		if (this.Lifetime > 0) this.Destroy();
	}

	public Destroy() {
		this.instance.Destroy();
		this.destroy();
	}

	public OnTick(_GetClient: () => Client) {
		if (this.Lifetime <= 0) return;

		this.TimeAlive++;
		if (this.TimeAlive > this.Lifetime) {
			this.Destroy();

			return;
		}

		this.Velocity = this.Velocity.mul(0.98).WithY(this.Velocity.Y - 0.065);
		if (this.Velocity.Magnitude <= 0) return;

		const Pivot = this.Object.GetPivot();
		let TargetPivot = Pivot.add(this.Velocity);
		const Direction = TargetPivot.Position.sub(Pivot.Position);

		const Size = 3.65;
		const FloorCast = workspace.Raycast(Pivot.Position, new Vector3(0, -0.25, 0), CollisionParams);
		if (FloorCast) {
			this.Velocity = this.Velocity.WithY(0);
			TargetPivot = TargetPivot.Rotation.add(FloorCast.Position.add(new Vector3(0, Size / 2 + 0.05, 0)));
		}

		const Cast = Workspace.Blockcast(Pivot, Vector3.one.mul(Size), Direction.Unit.mul(Direction.Magnitude), CollisionParams);
		if (Cast) {
			const Bounce = Cast.Normal.mul(-this.Velocity.Dot(Cast.Normal));
			const [SurfaceSpeed] = PlaneProject(this.Velocity, Cast.Normal);
			this.Velocity = SurfaceSpeed.mul(0.9).add(Bounce.mul(0.8));

			TargetPivot = TargetPivot.Rotation.add(Pivot.Position.add(Direction.Unit.mul(Cast.Distance)).add(new Vector3(0, 0.05, 0)));
		}

		this.Object.PivotTo(TargetPivot);

		if (this.TimeAlive >= this.Lifetime - TwoSeconds) {
			const IsVisible = this.TimeAlive % 10 < 5 ? 0 : 1;
			if (this.instance.ObjectModel.Ring.LocalTransparencyModifier !== IsVisible) this.SetTransparency(IsVisible, true);
		}
	}

	public OnRespawn() {
		this.State.Set("Uncollected");
	}

	public OnStreamOut() {
		this.Animation.Destroy();
		this.Connections.Disconnect();
		this.State.Destroy();
	}

	private SetTransparency(Transparency: number, Fake?: boolean) {
		for (const [_, Instance] of pairs(this.Object.GetDescendants())) {
			if (Instance.IsA("BasePart") || Instance.IsA("Decal")) Instance.LocalTransparencyModifier = Transparency;
		}

		if (this.Animation !== undefined)
			if (Transparency >= 1) this.Animation.Stop();
			else this.Animation.Play();

		if (!Fake) this.Root.CanQuery = Transparency <= 0;
	}

	public Serialize(): unknown {
		return this.State.Serialize();
	}

	public Deserialize(Data: unknown) {
		this.State.Deserialize(Data);
	}
}

export = Ring;
