import { AddLog } from "shared/common/logger"
import { Camera } from "./draw/camera"
import { Renderer } from "./draw/renderer"
import { StateMachine } from "./statemachine"
import * as Render from "shared/common/renderregistry"
import { Input } from "./control/input"
import { CharacterInfo } from "shared/characterinfo"
import { UIMain } from "./ui"
import { Animation } from "./draw/animation"
import { FrameworkState } from "shared/common/frameworkstate"
import { Ground } from "./modules/ground"

/**
 * Flags list
 * @class
 */
export class DefaultFlags {
    public LastUp = Vector3.yAxis

    /**
     * Does not control the `JumpBall` or `Roll`, view `Player.EnterBall` for more info
     */
    public BallEnabled = false
    public TrailEnabled = false

    
    public Gravity = new Vector3(0, -1, 0)
    
    // Moves
    /**
     * Timer to reduce gravity while holding `Player.Input.Button.Jump` 
     */
    public JumpTimer = 0
    public SpindashSpeed = 0
    public Bounces = 0
    public IsBounce = false
}

let PreviousAngle:CFrame|undefined

/**
 * Player
 * @class
 */
export class Player {
    // Main
    public readonly Character: Model
    public Position: Vector3
    public Speed: Vector3
    public Angle: CFrame
    public LastCFrame: CFrame
    public CurrentCFrame: CFrame
    public RenderCFrame: CFrame
    
    // Flags
    public Flags:DefaultFlags
    
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
    
    // Components
    public Ground: Ground

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
        this.Input = new Input()
        this.UI = new UIMain()

        this.Ground = new Ground()

        this.Flags = new DefaultFlags()

        Render.RegisterStepped("Player", Enum.RenderPriority.Input.Value + 1, (DeltaTime) => this.Update(DeltaTime))
        
        PreviousAngle = CFrame.identity

        AddLog(`Loaded new player ${Character}`)
    }

    /**
     * Destroys the Player
     */
    public Destroy() {
        
    }

    /**
     * Update player once per frame, **do not run this method if you do not know what you're doing!**
     */
    public Update(DeltaTime:number) {
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

        // Interpolate positions
        this.RenderCFrame = this.LastCFrame.Lerp(this.Angle.add(this.Position), this.State.TickTimer)

        this.Renderer.Draw(DeltaTime)
        this.Camera.Update(DeltaTime)
    }

    // Utility functions
    /**
     * Returns the players current CFrame
     * @returns {CFrame}
     */
    public GetAngle() {
        return this.Angle.add(this.Position)
    }

    /**
     * Convert a vector into a local space vector centered on the Player's {0,0,0}
     * 
     * Mainly used for Player.Speed
     * @param Vector Vector to convert
     * @returns Local vector
     */
    public ToLocal(Vector:Vector3) {
        return (this.GetAngle().mul(CFrame.Angles(0, math.rad(90), 0))).VectorToObjectSpace(Vector)
    }

    /**
     * Inverse of Player.ToLocal, converts a vector from player local space to world space
     * 
     * Mainly used for Player.Speed
     * @param Vector Vector to convert
     * @returns Global vector
     */
    public ToGlobal(Vector:Vector3) {
        return (this.GetAngle().mul(CFrame.Angles(0, math.rad(90), 0))).VectorToWorldSpace(Vector)
    }

    /**
     * Get the scripted center of the player
     * @returns Player center position
     */
    public GetMiddle() {
        return this.Position.add(this.Angle.UpVector.mul(this.Physics.Height * this.Physics.Scale))
    }

    /**
     * !! THIS METHOD IS AUTOMATICALLY RAN ON PLAYER.ANGLE CHANGE !!
     * 
     * 
     * Updates Player.Ground.DotProduct (Dot product of Player.Angle and Player.Flags.Gravity)
     */
    public SetGroundRelative() {
        this.Ground.DotProduct = this.Angle.UpVector.mul(-1).Dot(this.Flags.Gravity.Unit)
    }

    /**
     * Forces player into ball
     * 
     * This does **NOT** control the `Roll` **OR** the `JumpBall`:
     * 
     * `Player.Animation.Current = "Roll"` will set you to `Roll`
     * 
     * `JumpBall` will be automatically triggered if Animation is `Roll` `and Player.Flags.TrailEnabled === true`
     */
    public EnterBall() {
        this.Flags.TrailEnabled = false
        this.Flags.BallEnabled = true
    }

    /**
     * Exits the Players current ball, check Player.EnterBall for `Roll`/`JumpBall` rules
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
}