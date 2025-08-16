import { Connector } from "shared/common/class/connector"
import { AddLog } from "shared/common/utility/logger"
import { Client } from "shared/client"

/**
 * @class
 * @object
 */
class SrcObject {
    public readonly Object: Model
    public readonly Root: BasePart
    public Debounce = 0
    protected Connections = new Connector()

    constructor(Object: Model) {
        if (!Object.PrimaryPart) {
            AddLog(`Failed to load object ${script.Name}! No PrimaryPart set!`)
            error()
        }

        this.Object = Object
        this.Root = Object.PrimaryPart
    }

    protected OnTick() {
        if (this.Debounce > 0) {
            this.Debounce -= 1
        }
    }

    /**
     * Client touched callback
     * @param Client
     */
    protected OnTouch(Client: Client) { }

    /**
     * .RenderStepped callback
     * @param DeltaTime
     */
    protected PreRender(DeltaTime: number) { }

    protected OnRespawn() { }

    public Tick() {
        this.OnTick()
    }

    public TouchClient(Client: Client) {
        this.OnTouch(Client)
    }

    public Draw(DeltaTime: number) {
        this.PreRender(DeltaTime)
    }

    public Respawn() {
        this.OnRespawn()
    }
}

export = SrcObject