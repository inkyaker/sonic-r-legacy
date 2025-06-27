export class GlobalReference {
    private Path
    constructor(Path:string) {
        this.Path = Path
    }

    public Get() {
        const Splits = this.Path.split("/")
        let Target:Instance = game

        Splits.forEach((Value, Index) => {
            Target = Target.WaitForChild(Value)
        })

        return Target
    }
}