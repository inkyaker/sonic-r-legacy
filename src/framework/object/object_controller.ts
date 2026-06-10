import type { Components } from "@flamework/components";
import { Controller, Modding, type OnStart } from "@flamework/core";
import { Workspace } from "shared/common/globals";
import type { Client } from "..";
import type BaseObject from "./objects/baseobj";
import type { OnDraw, OnRespawn, OnTick, OnTouch } from "./objects/object_implementables";

// TODO: on respawn w/ proper support for streaming (serializing object data?)

@Controller()
export class ObjectController implements OnStart {
	public Params: RaycastParams;
	public Skin: number = 1;
	public ActiveClient: Client | undefined;

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
	}

	public CollideWithClient() {
		if (!this.ActiveClient) return;

		const LastPosition = this.ActiveClient.LastCFrame.Position;
		if (LastPosition !== this.ActiveClient.Position) {
			const Look = CFrame.lookAt(LastPosition, this.ActiveClient.Position);
			const Magnitude = LastPosition.Distance(this.ActiveClient.Position);

			const Cast = Workspace.Spherecast(LastPosition.sub(Look.LookVector.mul(this.Skin)), this.Skin, Look.LookVector.mul(Magnitude + this.Skin), this.Params);
			if (Cast) this.GetObject(Cast.Instance)?.TouchClient(this.ActiveClient);
		}
	}

	public TickObjects() {
		if (!this.ActiveClient) return;

		// client reference is only valid for this one cycle
		for (const Object of this.OnTickListeners) task.spawn(() => Object.Tick(() => this.ActiveClient!));
	}

	public DrawObjects(DeltaTime: number) {
		for (const Object of this.OnDrawListeners) task.spawn(() => Object.Draw(DeltaTime));
	}

	public GetObject(Collider: BasePart) {
		const Model = Collider.FindFirstAncestorOfClass("Model");
		if (Model) return this.Components.getComponents<BaseObject<Model>>(Model)[0];
	}
}
