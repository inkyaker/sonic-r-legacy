import { deepCopy as DeepCopy } from "@rbxts/deepcopy";
import { Client } from "..";
import { AnimationList, InferredAnimation } from "shared/characterinfo";

type AnimationData = {
    EndAnimation?: keyof AnimationList,
    Transitions?: {
        [Index: string]: {
            From?: number,
            To?: number
        }
    }
}

/**
 * @class
 */
export class Animation {
    public Animations
    public Current: keyof AnimationList
    public Speed: number = 0
    private Last: keyof AnimationList

    constructor(Client: Client) {
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
                    NewInstance.AnimationId = `rbxassetid://${Value.AnimationID}`

                    Value.Asset = AnimationController.LoadAnimation(NewInstance)
                    Value.Asset.Looped = Value.Looped
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
    private UpdateState(Animation: InferredAnimation, Playing: boolean, TransitionTime?: number) {
        for (const [Key, Value] of pairs(Animation)) {
            if (typeOf(Key) !== "number") { continue }
            Value.Asset[Playing && "Play" || "Stop"](TransitionTime)
        }
    }

    private GetCurrentTrack(Client: Client, Animation: InferredAnimation) {
        let Track

        for (const [Key, Value] of pairs(Animation)) {
            if (typeOf(Key) !== "number") { continue }

            if (Value.Position !== undefined) {
                let Triggered = false

                const Next = Animation[Key + 1]
                if (Next && Next.Position) {
                    Triggered = Client.Speed.X >= Value.Position && Client.Speed.X < Next.Position
                } else {
                    Triggered = Client.Speed.X >= Value.Position
                }

                if (Triggered) { 
                    Track = Value.Asset
                    break
                }
            }
        }

        if (!Track) {
            Track = Animation[0].Asset
        }

        return Track
    }

    /**
     * Do not run
     * @param Client
     * @param Animation 
     */
    private UpdateCurrent(Client: Client, Animation: InferredAnimation) {
        for (const [Key, Value] of pairs(Animation)) {
            if (typeOf(Key) !== "number") { continue }

            if (Value.Position !== undefined) {
                const Triggered = this.GetCurrentTrack(Client, Animation) === Value.Asset

                if (Value.Speed) {
                    let Speed = Value.Speed.Base + (Value.Speed.Increment * this.Speed)
                    if (Value.Speed.Absolute) {
                        Speed = math.abs(Speed)
                    }

                    Value.Asset.AdjustSpeed(Speed)
                }
                Value.Asset.AdjustWeight(Triggered && .999 || .001)
            }
        }
    }

    /**
     * Change current Clients animation and update
     * @param Client 
     */
    public Animate(Client: Client) {
        const Previous = (this.Animations[this.Last] as InferredAnimation & AnimationData)
        const Next = (this.Animations[this.Current] as InferredAnimation & AnimationData)

        if (Previous === Next && Next.EndAnimation) {
            const Track = this.GetCurrentTrack(Client, Next)
            if (!Track.IsPlaying || Track.TimePosition >= Track.Length) {
                Track.Play(0, undefined, 1)
                Track.TimePosition = Track.Length - (1/60)
                
                this.Current = Next.EndAnimation as keyof AnimationList
            }
        }

        if (Previous !== Next) {
            this.Speed = 1

            let [TransitionTo, TransitionFrom]: [number | undefined, number | undefined] = [undefined, undefined]

            if (Previous.Transitions) {
                if (Previous.Transitions.All) {
                    const Transition = Previous.Transitions.All

                    TransitionTo = Transition.To
                    TransitionFrom = Transition.From
                }

                for (const [Target, Transition] of pairs(Previous.Transitions)) {
                    if (Target === "All") { continue }
                    
                    if (this.Current === Target && Transition.From !== undefined) {
                        TransitionFrom = Transition.From
                    }
                }
            }

            if (Next.Transitions) {
                if (Next.Transitions.All) {
                    const Transition = Next.Transitions.All

                    TransitionTo = Transition.To
                    TransitionFrom = Transition.From
                }

                for (const [Target, Transition] of pairs(Next.Transitions)) {
                    if (Target === "All") { continue }

                    if (this.Last === Target && Transition.From !== undefined) {
                        TransitionTo = Transition.From
                    }
                }
            }

            print(TransitionTo, TransitionFrom)

            this.UpdateState(Previous, false, TransitionFrom)
            this.UpdateState(Next, true, TransitionTo)

            this.Last = this.Current
        }

        this.UpdateCurrent(Client, Next)
    }
}