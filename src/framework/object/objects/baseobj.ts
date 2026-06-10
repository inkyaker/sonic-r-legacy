import type { DSClient } from "framework";
import { Connector } from "shared/common/class/connector";
import { AddLog } from "shared/common/utility/logger";

/**
 * @class
 * @object
 */
class SrcObject {
	public HomingTarget = false;
	public HomingWeight = 1;

	public readonly Object: Model;
	public readonly Root: BasePart;
	public Debounce = 0;
	protected Connections = new Connector();

	constructor(Object: Model) {
		if (!Object.PrimaryPart) {
			AddLog(`Failed to load object ${script.Name}! No PrimaryPart set!`);
			error();
		}

		this.Object = Object;
		this.Root = Object.PrimaryPart;
	}

	protected OnTick(_GetClient: () => DSClient) {
		if (this.Debounce > 0) {
			this.Debounce--;
		}
	}

	/**
	 * Client touched callback
	 * @param Client
	 */
	protected OnTouch(_Client: DSClient) {}

	/**
	 * .RenderStepped callback
	 * @param DeltaTime
	 */
	protected PreRender(_DeltaTime: number) {}

	protected OnRespawn() {}

	public Tick(GetClient: () => DSClient) {
		this.OnTick(GetClient);
	}

	public TouchClient(Client: DSClient) {
		if (this.Debounce > 0) {
			return;
		}

		this.OnTouch(Client);
	}

	public Draw(DeltaTime: number) {
		this.PreRender(DeltaTime);
	}

	public Respawn() {
		this.OnRespawn();
	}
}

export = SrcObject;
