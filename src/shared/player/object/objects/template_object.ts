import { AddLog } from "shared/common/logger"

export class TestObject {
    public readonly Object: Model
    public readonly Root: BasePart

    constructor(Object:Model) {
        if (!Object.PrimaryPart) { 
            AddLog(`Failed to load object ${script.Name}! No PrimaryPart set!`)
            error()
         }

        this.Object = Object
        this.Root = Object.PrimaryPart
    }
}