import { deepCopy as DeepCopy } from "@rbxts/deepcopy";
import { Client } from "..";
import { AnimationList, InferredAnimation } from "shared/characterinfo";
/**
 * @class
 */
export class Animation {
    public Animations
    public Current: keyof AnimationList
    public Speed: number = 0
    private Last: keyof AnimationList

    constructor(Client: Client) {
        Client.Physics

        this.Animations = DeepCopy(Client.Animations)
        this.Last = "Idle"
        this.Current = "Fall"

        this.LoadAnimations(Client)
    }

    /**
     * Load all animations from `Client.Animations` and load events
     * @param Client
     */
    public LoadAnimations(Client: Client) {
        const AnimationController: Animator = (Client.Character.WaitForChild("Humanoid").WaitForChild("Animator") as Animator) // TODO: make animationcontroller.animator
        for (const [_, AnimationInfo] of pairs(this.Animations)) {
            for (const [Key, Value] of pairs(AnimationInfo)) {
                if (typeOf(Key) === "number") {
                    const NewInstance = new Instance("Animation")
                    NewInstance.AnimationId = `rbxassetid://${Value.id}`

                    Value.asset = AnimationController.LoadAnimation(NewInstance)
                }
            }
        }
    }

    /**
     * TODO: this
     */
    public UnloadAnimations() {

    }

    /**
     * Do not run
     * @param Animation
     * @param Playing
     */
    private UpdateState(Animation: InferredAnimation, Playing: boolean) {
        for (const [Key, Value] of pairs(Animation)) {
            if (typeOf(Key) !== "number") { continue }
            Value.asset[Playing && "Play" || "Stop"]()
        }
    }

    /**
     * Do not run
     * @param Client
     * @param Animation 
     */
    private UpdateCurrent(Client: Client, Animation: InferredAnimation) {
        for (const [Key, Value] of pairs(Animation)) {
            if (typeOf(Key) !== "number") { continue }

            if (Value.pos !== undefined) {
                let Triggered = false

                const Next = Animation[Key + 1]
                if (Next && Next.pos) {
                    Triggered = Client.Speed.X >= Value.pos && Client.Speed.X < Next.pos
                } else {
                    Triggered = Client.Speed.X >= Value.pos
                }

                // TODO: implement :adjustspeed
                Value.asset.AdjustSpeed(this.Speed)
                Value.asset.AdjustWeight(Triggered && .999 || .001)
            }
        }
    }

    /**
     * Change current Clients animation and update
     * @param Client 
     */
    public Animate(Client: Client) {
        const Previous = (this.Animations[this.Last] as InferredAnimation)
        const Next = (this.Animations[this.Current] as InferredAnimation)

        if (Previous !== Next) {
            this.Speed = 1
            this.UpdateState(Previous, false)
            this.UpdateState(Next, true)

            this.Last = this.Current
        }

        this.UpdateCurrent(Client, Next)
    }
}