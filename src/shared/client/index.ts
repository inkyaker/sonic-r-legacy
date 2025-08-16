import { AddLog } from "shared/common/utility/logger"
import { Camera } from "./draw/camera"
import { Renderer } from "./draw/renderer"
import { StateMachine } from "./statemachine"
import * as Render from "shared/common/utility/renderregistry"
import { Input } from "./control/input"
import { CharacterInfo } from "shared/characterinfo"
import { UIMain } from "./ui"
import { Animation } from "./draw/animation"
import { FrameworkState } from "shared/common/frameworkstate"
import { ObjectController } from "./object/objectcontroller"

/**
 * Flags list
 * @class
 */
class Flags {
    public LastUp = Vector3.yAxis

    /**
     * Does not control the `JumpBall` or `Roll`, view `Client.EnterBall` for more info
     */
    public BallEnabled = false
    public TrailEnabled = false


    public Gravity = new Vector3(0, -1, 0)

    // Moves
    /**
     * Timer to reduce gravity while holding `Client.Input.Button.Jump` 
     */
    public JumpTimer = 0
    public SpindashSpeed = 0
    public Bounces = 0
    public IsBounce = false

    /**
     * Amount of updates joystick input should be locked for
     */
    public LockTimer = 0 // TODO: implement
    /**
     * Flag that cancels out gravity while `Client.LockTimer > 0`
     */
    public DirectVelocity = false // TODO: implement
}

/**
 * Item/Collection state
 * @class
 * @ClientComponent
 */
class CollectState {
    public Shield: string | undefined
    public Power: string | undefined
    public Rings: number = 0
}

/**
 * Ground interaction container
 * @class
 * @ClientComponent
 */
class Ground {
    public Grounded: boolean = false
    public Floor: BasePart | undefined
    public FloorLast: CFrame | undefined
    public FloorOffset: CFrame | undefined
    public FloorSpeed: Vector3 = Vector3.zero

    /**
     * Dot product between `Client.Angle.UpVector` and `Client.Flags.Gravity`
     */
    public DotProduct: number = -1
}

let PreviousAngle: CFrame | undefined

/**
 * Client
 * @class
 */
export class Client {
    // Main
    public readonly Character: Model
    public Position: Vector3
    public Speed: Vector3
    public Angle: CFrame
    public LastCFrame: CFrame
    public CurrentCFrame: CFrame
    public RenderCFrame: CFrame

    // Flags
    public Flags: Flags
    public CollectState: CollectState

    // Character info
    public readonly Physics
    public readonly Animations

    // Modules
    public readonly State: StateMachine
    public readonly Camera: Camera
    public readonly Animation: Animation
    public readonly Renderer: Renderer
    public readonly Input: Input
    public readonly UI: UIMain
    public readonly Object: ObjectController

    // Components
    public Ground

    constructor(Character: Model) {
        this.Character = Character
        this.Position = Character.GetPivot().Position
        this.Angle = Character.GetPivot().Rotation
        this.Speed = Vector3.zero

        this.LastCFrame = this.Angle.add(this.Position)
        this.CurrentCFrame = this.LastCFrame
        this.RenderCFrame = this.CurrentCFrame

        this.Physics = CharacterInfo.Physics
        this.Animations = CharacterInfo.Animations

        this.State = new StateMachine(this)
        this.Animation = new Animation(this)
        this.Camera = new Camera(this)
        this.Renderer = new Renderer(this)
        this.Input = new Input(this)
        this.UI = new UIMain()
        this.Object = new ObjectController(this)

        this.Ground = new Ground()

        this.Flags = new Flags()
        this.CollectState = new CollectState()

        Render.RegisterStepped("Client", Enum.RenderPriority.Input.Value + 1, (DeltaTime) => this.Update(DeltaTime))

        PreviousAngle = CFrame.identity

        AddLog(`Loaded new Client ${Character}`)
    }

    /**
     * Destroys the Client
     */
    public Destroy() {

    }

    /**
     * Update Client once per frame, **do not run this method if you do not know what you're doing!**
     */
    public Update(DeltaTime: number) {
        // Angle
        if (PreviousAngle !== this.Angle) {
            this.SetGroundRelative()
            PreviousAngle = this.Angle
        }

        if (FrameworkState.GameSpeed === 0) {
            this.Input.PrepareReset()
        }

        this.Input.Update()

        // Update state machine
        this.State.Update(DeltaTime)

        // Change input locks
        if (this.Flags.LockTimer > 0) {
            this.Flags.LockTimer -= 1
        }

        // Interpolate positions
        this.RenderCFrame = this.LastCFrame.Lerp(this.Angle.add(this.Position), this.State.TickTimer)

        this.Renderer.Draw(DeltaTime)
        this.Camera.Update(DeltaTime)
    }

    // Utility functions
    /**
     * Returns the Clients current CFrame
     * @returns {CFrame}
     */
    public GetCFrame() {
        return this.Angle.add(this.Position)
    }

    /**
     * Convert a vector into a local space vector centered on the Client's {0,0,0}
     * 
     * Mainly used for Client.Speed
     * @param Vector Vector to convert
     * @returns Local vector
     */
    public ToLocal(Vector: Vector3) {
        return (this.GetCFrame().mul(CFrame.Angles(0, math.rad(90), 0))).VectorToObjectSpace(Vector)
    }

    /**
     * Inverse of Client.ToLocal, converts a vector from Client local space to world space
     * 
     * Mainly used for Client.Speed
     * @param Vector Vector to convert
     * @returns Global vector
     */
    public ToGlobal(Vector: Vector3) {
        return (this.GetCFrame().mul(CFrame.Angles(0, math.rad(90), 0))).VectorToWorldSpace(Vector)
    }

    /**
     * Get the scripted center of the Client
     * @returns Client center position
     */
    public GetMiddle() {
        return this.Position.add(this.Angle.UpVector.mul(this.Physics.Height * this.Physics.Scale))
    }

    /**
     * !! THIS METHOD IS AUTOMATICALLY RAN ON Client.ANGLE CHANGE !!
     * 
     * 
     * Updates Client.Ground.DotProduct (Dot product of Client.Angle and Client.Flags.Gravity)
     */
    public SetGroundRelative() {
        this.Ground.DotProduct = this.Angle.UpVector.mul(-1).Dot(this.Flags.Gravity.Unit)
    }

    /**
     * Forces Client into ball
     * 
     * This does **NOT** control the `Roll` **OR** the `JumpBall`:
     * 
     * `Client.Animation.Current = "Roll"` will set you to `Roll`
     * 
     * `JumpBall` will be automatically triggered if Animation is `Roll` `and Client.Flags.TrailEnabled === true`
     */
    public EnterBall() {
        this.Flags.TrailEnabled = false
        this.Flags.BallEnabled = true
    }

    /**
     * Exits the Clients current ball, check Client.EnterBall for `Roll`/`JumpBall` rules
     */
    public ExitBall() {
        this.Flags.TrailEnabled = false
        this.Flags.BallEnabled = false
    }

    /**
     * Helper method to cleanup all air-specific actions, run this when landed
     */
    public Land() {
        this.ExitBall()
        this.Flags.Bounces = 0
        this.Flags.IsBounce = false
    }

    public Damage(Source: Vector3) {
        if (Source.mul(new Vector3(1, 0, 1)) !== this.Position.mul(new Vector3(1, 0, 1))) {
            const TargetCFrame = CFrame.lookAt(this.Position.mul(new Vector3(1, 0, 1)), Source.mul(new Vector3(1, 0, 1)))

            this.Angle = TargetCFrame.Rotation
        }

        this.Speed = new Vector3(-2, 3, 0) // TODO: mirror https://github.com/SonicOnset/DigitalSwirl-Client/blob/1e01658bab4e8b664abe865634c60ec71bc4b114/ControlScript/Client/init.lua#L388C2-L397C5
    }
}