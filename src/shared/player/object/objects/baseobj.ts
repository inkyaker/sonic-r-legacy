import { Connector } from "shared/common/class/connector"
import { AddLog } from "shared/common/utility/logger"
import { Player } from "shared/player"

/**
 * @class
 * @object
 */
export class BaseObj {
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
     * Player touched callback
     * @param Player
     */
    protected OnTouch(Player: Player) { }

    /**
     * .RenderStepped callback
     * @param DeltaTime
     */
    protected PreRender(DeltaTime: number) { }

    protected OnDestroy() { }

    public Tick() {
        this.OnTick()
    }

    public TouchPlayer(Player: Player) {
        this.OnTouch(Player)
    }

    public Draw(DeltaTime: number) {
        this.PreRender(DeltaTime)
    }

    public Destroy() {
        this.Connections.Disconnect()

        this.OnDestroy()
    }
}