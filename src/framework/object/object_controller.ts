import type { Components } from "@flamework/components";
import { Controller, Dependency, Modding, type OnStart } from "@flamework/core";
import { Workspace } from "shared/common/globals";
import type { GameController } from "shared/loader.server";
import type BaseObject from "./objects/baseobj";
import type { OnDraw, OnRespawn, OnTick, OnTouch } from "./objects/object_implementables";

// TODO: on respawn w/ proper support for streaming (serializing object data?)

@Controller()
export class ObjectController implements OnStart {
	public Params: RaycastParams;
	public Skin: number = 1;
	public Controller!: GameController;

	constructor(private Components: Components) {
		this.Params = new RaycastParams();
		this.Params.FilterType = Enum.RaycastFilterType.Include;
		this.Params.FilterDescendantsInstances = [Workspace.Level.Objects];
	}

	public readonly OnTouchListeners = new Set<OnTouch>();
	public readonly OnTickListeners = new Set<OnTick>();
	public readonly OnDrawListeners = new Set<OnDraw>();
	public readonly OnRespawnListeners = new Set<OnRespawn>();
	public onStart() {
		Modding.onListenerAdded<OnTouch>((Obj) => {
			this.OnTouchListeners.add(Obj);
		});
		Modding.onListenerRemoved<OnTouch>((Obj) => this.OnTouchListeners.delete(Obj));

		Modding.onListenerAdded<OnTick>((Obj) => this.OnTickListeners.add(Obj));
		Modding.onListenerRemoved<OnTick>((Obj) => this.OnTickListeners.delete(Obj));

		Modding.onListenerAdded<OnDraw>((Obj) => this.OnDrawListeners.add(Obj));
		Modding.onListenerRemoved<OnDraw>((Obj) => this.OnDrawListeners.delete(Obj));

		Modding.onListenerAdded<OnRespawn>((Obj) => this.OnRespawnListeners.add(Obj));
		Modding.onListenerRemoved<OnRespawn>((Obj) => this.OnRespawnListeners.delete(Obj));

		this.Controller = Dependency<GameController>(); // antipattern!
	}

	public CollideWithClient() {
		const ActiveClient = this.Controller.ActiveClient;
		if (!ActiveClient) return;

		const LastPosition = ActiveClient.LastCFrame.Position;
		if (LastPosition !== ActiveClient.Position) {
			const Look = CFrame.lookAt(LastPosition, ActiveClient.Position);
			const Magnitude = LastPosition.Distance(ActiveClient.Position);

			const Cast = Workspace.Spherecast(LastPosition.sub(Look.LookVector.mul(this.Skin)), this.Skin, Look.LookVector.mul(Magnitude + this.Skin), this.Params);
			if (Cast) this.GetObject(Cast.Instance)?.TouchClient(ActiveClient);
		}
	}

	public TickObjects() {
		if (!this.Controller.ActiveClient) return;

		// client reference is only valid for this one cycle
		for (const Object of this.OnTickListeners) task.spawn(() => Object.Tick(() => this.Controller.ActiveClient!));
	}

	public DrawObjects(DeltaTime: number) {
		for (const Object of this.OnDrawListeners) task.spawn(() => Object.Draw(DeltaTime));
	}

	public GetObject(Collider: BasePart) {
		const Model = Collider.FindFirstAncestorOfClass("Model");
		if (Model) return this.Components.getComponents<BaseObject<Model>>(Model)[0];
	}
}
