/**
 * Ground component interface
 * 
 * @component
 * @injects Player
 */
export class Ground {
    public Grounded: boolean = false
    public Floor: BasePart|undefined
    public FloorLast: CFrame|undefined
    public FloorOffset: CFrame|undefined
    public FloorSpeed: Vector3 = Vector3.zero

    /**
     * Dot product between `Player.Angle.UpVector` and `Player.Flags.Gravity`
     */
    public DotProduct: number = -1
}