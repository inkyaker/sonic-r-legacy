import { Client } from "..";

/**
 * Client renderer
 * @class
 */
export class Renderer {
    private Client: Client

    constructor(Client: Client) {
        this.Client = Client
    }

    /**
     * Draw Client, should only execute at the end of each `RenderStepped`
     * @returns {undefined}
     */
    public Draw(DeltaTime: number): undefined {
        const Root = this.Client.Character.PrimaryPart
        if (!Root || !Root.IsA("BasePart")) { return }

        let Position = this.Client.RenderCFrame.Position
        Position = Position.add(this.Client.Angle.UpVector.mul((Root.Size.Y / 2) + (this.Client.Character.FindFirstChildOfClass("Humanoid")?.HipHeight || 0)))

        this.Client.Character.PivotTo(this.Client.RenderCFrame.Rotation.add(Position))
    }
}