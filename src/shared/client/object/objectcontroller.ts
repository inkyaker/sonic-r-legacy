import { Workspace } from "shared/common/globals"
import SrcObject from "./objects/baseobj"
import { Client } from ".."

// TODO: see if theres a better way to do this
// a dynamic list for all that extends SrcObject would be nice, and could also be implemented for states rather than a fixed registry
const ObjectClasses = new Map<string, typeof SrcObject>()
for (const [_, Module] of pairs((script.Parent as Folder & { objects: Folder }).objects.GetDescendants())) {
    if (!Module.IsA("ModuleScript")) { continue }
    const Class = require(Module) as typeof SrcObject
    const Name = tostring(Class)
    print(Class)

    ObjectClasses.set(Name, Class)
}

export class ObjectController {
    public Params: RaycastParams
    public Objects: Map<Model, SrcObject>
    public Skin: number = 1
    private LastUpdatedPosition: Vector3
    private Client

    constructor(Client: Client) {
        this.Objects = new Map()
        this.Client = Client

        print(ObjectClasses)

        for (const [Index, Model] of pairs(Workspace.Level.Objects.GetDescendants())) {
            if (!Model.IsA("Model")) { print(`continue`); continue }
            
            const Class = ObjectClasses.get(Model.Name)
            print(`missing class ${Model.Name}`)
            if (!Class) { continue }

            const Target = new Class(Model)

            this.Objects.set(Model, Target)
            print(`added object ${Model.Name}`)
        }

        this.Params = new RaycastParams()
        this.Params.FilterType = Enum.RaycastFilterType.Include
        this.Params.FilterDescendantsInstances = [Workspace.Level.Objects]

        this.LastUpdatedPosition = Client.Position
    }

    public CollideWithClient() {
        if (this.LastUpdatedPosition !== this.Client.Position) {
            const Look = CFrame.lookAt(this.LastUpdatedPosition, this.Client.Position)
            const Magnitude = this.LastUpdatedPosition.Distance(this.Client.Position)

            const Cast = Workspace.Spherecast(this.LastUpdatedPosition.sub(Look.LookVector.mul(this.Skin)), this.Skin, Look.LookVector.mul(Magnitude + this.Skin), this.Params)
            if (Cast) {
                const Model = Cast.Instance.FindFirstAncestorOfClass("Model")

                if (Model) {
                    this.Objects.get(Model)?.TouchClient(this.Client)
                }
            }

            this.LastUpdatedPosition = this.Client.Position
        }
    }

    public TickObjects() {

    }
}