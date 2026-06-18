import { BaseComponent, Component } from "@flamework/components";
import type { OnStart } from "@flamework/core";
import type { Client } from "framework";
import { Connector } from "shared/common/class/connector";
import { AddLog } from "shared/common/utility/logger";
import type { OnDraw, OnObjectStart, OnRespawn, OnTick, OnTouch } from "./object_implementables";

/**
 * @class
 * @object
 */
@Component({
	refreshAttributes: false,
})
class BaseObject<T extends Model>
	extends BaseComponent<
		{
			UniqueID: string;
		},
		T
	>
	implements OnObjectStart, OnStart, OnTick, OnDraw, OnTouch, OnRespawn
{
	public HomingTarget = false;
	public HomingWeight = 1;

	public Object!: Model;
	public Root!: BasePart;
	public Debounce = 0;
	protected Connections = new Connector();

	public SetupModel() {
		const Object = this.instance;

		if (!Object.PrimaryPart) {
			AddLog(`Failed to load object ${script.Name}! No PrimaryPart set!`, { Error: true });
		}

		this.Object = Object;
		this.Root = Object.PrimaryPart!;
	}

	public onStart() {
		this.SetupModel();
	}

	public OnStart(Data?: unknown) {
		if (Data) this.Deserialize(Data);
	}

	public OnTick(_GetClient: () => Client) {
		if (this.Debounce > 0) {
			this.Debounce--;
		}
	}

	/**
	 * Client touched callback
	 * @param Client
	 */
	public OnTouch(_Client: Client) {}

	/**
	 * .RenderStepped callback
	 * @param DeltaTime
	 */
	public OnDraw(_DeltaTime: number) {}

	public OnRespawn() {}

	public Tick(GetClient: () => Client) {
		this.OnTick(GetClient);
	}

	public TouchClient(Client: Client) {
		if (this.Debounce > 0) {
			return;
		}

		this.OnTouch(Client);
	}

	public Draw(DeltaTime: number) {
		this.OnDraw(DeltaTime);
	}

	public Respawn() {
		this.OnRespawn();
	}

	/**
	 * this function MUST act as a destroy/cleanup function
	 */
	public OnStreamOut() {
		this.Connections.Disconnect();
	}

	/**
	 * called on object deload to save its persistent data
	 */
	public Serialize(): unknown {
		return {};
	}

	/**
	 * load object's persistent state from data (sourced from {@link Serialize})
	 * @param Data
	 */
	public Deserialize(_Data: unknown) {}
}

export = BaseObject;
