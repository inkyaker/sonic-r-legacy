import type { Components } from "@flamework/components";
import { Controller, Dependency, Modding, type OnStart } from "@flamework/core";
import { Workspace } from "shared/common/globals";
import type { GameController } from "shared/loader.server";
import type BaseObject from "./objects/baseobj";
import type { OnDraw, OnObjectStart, OnRespawn, OnTick, OnTouch } from "./objects/object_implementables";

@Controller()
export class ObjectController implements OnStart {
	public Params: RaycastParams;
	public OverlapParams: OverlapParams;
	public Skin: number = 3;
	public Controller!: GameController;
	public ObjectDataCache: Record<string, unknown> = {};

	constructor(private Components: Components) {
		this.Params = new RaycastParams();
		this.Params.FilterType = Enum.RaycastFilterType.Include;
		this.Params.FilterDescendantsInstances = [Workspace.Level.Objects];

		this.OverlapParams = new OverlapParams();
		this.OverlapParams.FilterType = Enum.RaycastFilterType.Include;
		this.OverlapParams.FilterDescendantsInstances = [Workspace.Level.Objects];
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
		Modding.onListenerAdded<OnObjectStart>((Obj) => Obj.OnStart(this.ObjectDataCache[(Obj as unknown as BaseObject<Model>).attributes.UniqueID]));

		this.Controller = Dependency<GameController>(); // antipattern!

		this.Components.onComponentRemoved<BaseObject<Model>>((Object) => {
			const ID = Object.attributes.UniqueID;
			const Data = Object.Serialize();
			
			this.ObjectDataCache[ID] = Data;
			
			Object.OnStreamOut()
		});
	}

	public CollideWithClient() {
		const ActiveClient = this.Controller.ActiveClient;
		if (!ActiveClient) return;

		const [Position, LastPosition] = [ActiveClient.GetMiddle(), ActiveClient.LastCFrame.Position.add(ActiveClient.GetYOffset())]
		if (LastPosition !== Position) {
			const Look = CFrame.lookAt(LastPosition, Position);
			const Magnitude = LastPosition.Distance(Position);

			// TODO: this works for now but maybe a better solution that isnt iterative
			const Objects = new Set<BaseObject<Model>>();
			while (true) {
				const Cast = Workspace.Spherecast(LastPosition.sub(Look.LookVector.mul(this.Skin)), this.Skin, Look.LookVector.mul(Magnitude + this.Skin), this.Params);
				if (Cast) {
					const Object = this.GetObject(Cast.Instance);
					if (!Object || Objects.has(Object)) break;
					Object.TouchClient(ActiveClient);
					Objects.add(Object);
				} else break;
			}
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

	public Respawn() {
		for (const Object of this.OnRespawnListeners) task.spawn(() => Object.Respawn());
	}
}
