import { Player } from "..";
import * as VUtil from "shared/common/utility/vutil";
import * as CFUtil from "shared/common/utility/cfutil";

export enum IntertiaState {
    FULL_INERTIA,
    GROUND_NOFRICT,
}

export const PhysicsHandler = {
    // Acceleration
    /**
     * Apply grounded acceleration, gravity calculations are separate
     * @param Player 
     */
    AccelerateGrounded: (Player: Player) => {
        const MaxXSoeed = Player.Physics.MaxXSpeed
        const RunAcceleration = Player.Physics.RunAcceleration
        const Friction = /*self.flag.grounded and self.frict_mult*/ 1 || 1

        //Get analogue state
        let Acceleration = new Vector3(0, 0, 0)
        let MovementAcceleration = 0
        let [HasControl, Turn, Magnitude] = Player.Input.Get(Player)

        //X air drag
        // TODO: see if i can improve
        if (HasControl) {
            if (Player.Speed.X <= MaxXSoeed || Player.Ground.DotProduct <= 0.96) {
                if (Player.Speed.X > MaxXSoeed) {
                    Acceleration = Acceleration.add(new Vector3((Player.Speed.X - MaxXSoeed) * Player.Physics.AirResist.X, 0, 0))
                } else if (Player.Speed.X < 0) {
                    Acceleration = Acceleration.add(new Vector3(Player.Speed.X * Player.Physics.AirResist.X, 0, 0))
                }
            } else {
                Acceleration = Acceleration.add(new Vector3((Player.Speed.X - MaxXSoeed) * (Player.Physics.AirResist.X * 1.7), 0, 0))
            }
        } else {
            if (Player.Speed.X > Player.Physics.RunSpeed) {
                Acceleration = Acceleration.add(new Vector3(Player.Speed.X * Player.Physics.AirResist.X))
            } else if (Player.Speed.X > MaxXSoeed) {
                Acceleration = Acceleration.add(new Vector3((Player.Speed.X - MaxXSoeed) * Player.Physics.AirResist.X))
            } else if (Player.Speed.X < 0) {
                Acceleration = Acceleration.add(new Vector3(Player.Speed.X * Player.Physics.AirResist.X))
            }
        }

        //Y and Z air drag
        Player.Speed = Player.Speed.add(Player.Speed.mul(new Vector3(0, Player.Physics.AirResist.Y, Player.Physics.AirResist.Z)))

        //Movement
        if (HasControl) {
            //Get acceleration
            if (Player.Speed.X >= MaxXSoeed) {
                //Use lower acceleration if above max speed
                if (Player.Speed.X < MaxXSoeed || Player.Ground.DotProduct >= 0) {
                    MovementAcceleration = RunAcceleration * Magnitude * 0.4
                } else {
                    MovementAcceleration = RunAcceleration * Magnitude
                }
            } else {
                //Get acceleration, stopping at intervals based on analogue stick magnitude
                MovementAcceleration = 0

                if (Player.Speed.X >= Player.Physics.JogSpeed) {
                    if (Player.Speed.X >= Player.Physics.RunSpeed) {
                        if (Magnitude <= 0.9) {
                            MovementAcceleration = RunAcceleration * Magnitude * 0.3
                        } else {
                            MovementAcceleration = RunAcceleration * Magnitude
                        }
                    } else if (Magnitude <= 0.7) {
                        if (Player.Speed.X < Player.Physics.RunSpeed) {
                            MovementAcceleration = RunAcceleration * Magnitude
                        }
                    } else {
                        MovementAcceleration = RunAcceleration * Magnitude
                    }
                } else if (Magnitude <= 0.5) {
                    if (Player.Speed.X < (Player.Physics.JogSpeed + Player.Physics.RunSpeed) * 0.5) {
                        MovementAcceleration = RunAcceleration * Magnitude
                    }
                } else {
                    MovementAcceleration = RunAcceleration * Magnitude
                }
            }

            //Turning
            const AbsoluteTurn = math.abs(Turn)
            if (math.abs(Player.Speed.X) < 0.001 && AbsoluteTurn > math.rad(22.5)) {
                MovementAcceleration = 0
                PhysicsHandler.Turn(Player, Turn, IntertiaState.FULL_INERTIA)
            } else {
                if (Player.Speed.X < (Player.Physics.JogSpeed + Player.Physics.RunSpeed) * 0.5 || AbsoluteTurn <= math.rad(22.5)) {
                    if (Player.Speed.X < Player.Physics.JogSpeed || AbsoluteTurn >= math.rad(22.5)) {
                        if (Player.Speed.X < Player.Physics.DashSpeed || !Player.Ground.Grounded) {
                            if (Player.Speed.X >= Player.Physics.JogSpeed && Player.Speed.X <= Player.Physics.RushSpeed && AbsoluteTurn > math.rad(45)) {
                                MovementAcceleration *= 0.8
                            }
                            PhysicsHandler.Turn(Player, Turn, undefined)
                        } else {
                            PhysicsHandler.Turn(Player, Turn, IntertiaState.GROUND_NOFRICT)
                        }
                    } else {
                        PhysicsHandler.Turn(Player, Turn, IntertiaState.GROUND_NOFRICT)
                    }
                } else {
                    MovementAcceleration = Player.Physics.StandardDeceleration / Friction
                    PhysicsHandler.Turn(Player, Turn, undefined)
                }
            }
        } else {
            //Decelerate
            MovementAcceleration = PhysicsHandler.GetDecel(Player.Speed.X + Acceleration.X, Player.Physics.StandardDeceleration)
        }

        //Apply movement acceleration
        Acceleration = Acceleration.add(new Vector3(MovementAcceleration * Friction, 0, 0))

        //Apply acceleration
        Player.Speed = Player.Speed.add(Acceleration)
    },

    /**
     * Apply airborne acceleration, gravity calculations are separate
     * @param Player 
     */
    AccelerateAirborne: (Player: Player) => {
        // TODO:
        PhysicsHandler.AccelerateGrounded(Player)

        if /*(self.rail_trick > 0) ||*/ (Player.Flags.JumpTimer > 0 && Player.Flags.BallEnabled && Player.Input.Button.Jump.Activated) {
            Player.Flags.JumpTimer -= 1
            Player.Speed = Player.Speed.add(new Vector3(0, Player.Physics.JumpHoldForce * 0.8 /* * (1 + self.rail_trick / 2)*/, 0))
        }
    },

    // Gravity
    ApplyGravity: (Player: Player) => {
        const weight = Player.Physics.Weight

        //Get cross product between our moving velocity and floor normal
        const FloorCrossSpeed = Player.Flags.LastUp.Cross(Player.ToGlobal(Player.Speed)) // TODO: replace with floor normal if needed
        let GravityAcceleration = Player.ToLocal(Player.Flags.Gravity.mul(weight))
        if (Player.Ground.DotProduct < 0.875) {
            if (Player.Ground.DotProduct >= 0.1 || math.abs(FloorCrossSpeed.Y) <= 0.6 || Player.Speed.X < 1.16) {
                if (Player.Ground.DotProduct >= -0.4 || Player.Speed.X <= 1.16) {
                    if (Player.Ground.DotProduct < -0.3 && Player.Speed.X > 1.16) {

                    } else if (Player.Ground.DotProduct < -0.1 && Player.Speed.X > 1.16) {

                    } else if (Player.Ground.DotProduct < 0.5 && math.abs(Player.Speed.X) < Player.Physics.RunSpeed) {
                        GravityAcceleration = GravityAcceleration.mul(new Vector3(4.225, 1, 4.225))
                    } else if (Player.Ground.DotProduct >= 0.7 || math.abs(Player.Speed.X) > Player.Physics.RunSpeed) {
                        if (Player.Ground.DotProduct >= 0.87 || Player.Physics.JogSpeed <= math.abs(Player.Speed.X)) {

                        } else {
                            GravityAcceleration = GravityAcceleration.mul(new Vector3(1, 1, 1.4))
                        }
                    } else {
                        GravityAcceleration = GravityAcceleration.mul(new Vector3(1, 1, 2))
                    }
                } else {

                }
            } else {
                GravityAcceleration = new Vector3(0, -weight, 0)
            }
        } else {
            GravityAcceleration = new Vector3(0, -weight, 0)
        }

        Player.Speed = Player.Speed.add(GravityAcceleration)
    },

    // Movement
    // TOOD: port https://github.com/SonicOnset/DigitalSwirl-Client/blob/master/ControlScript/Player/Movement.lua
    AlignToGravity: (Player: Player) => {
        if (/*Player.Speed.magnitude < Player.p.dash_speed*/ true /*TODO: this*/) {
            //Remember previous speed
            const prev_spd = Player.ToGlobal(Player.Speed)

            //Get next angle
            const from = Player.Angle.UpVector
            const to = Player.Flags.Gravity.Unit.mul(-1)
            const turn = VUtil.Angle(from, to)

            if (turn !== 0) {
                const max_turn = math.rad(11.25)
                const lim_turn = math.clamp(turn, -max_turn, max_turn)

                const next_ang = CFUtil.FromToRotation(from, to).mul(Player.Angle)

                Player.Angle = (Player.Angle.Lerp(next_ang, lim_turn / turn))
            }

            //Keep using previous speed
            Player.Speed = Player.ToLocal(prev_spd)
        }
    },
    /**
     * Slowdown function to emulate skidding
     * 
     * Used in `Skid` and `Spindash`
     * @param Player 
     */
    Skid: (Player: Player) => {
        const FrictionMultiplier = 1 // TODO: fricton mult


        // TODO: see if sm is required here
        const XFriction = Player.Physics.SkidFriction * FrictionMultiplier
        const ZFriction = Player.Physics.GroundFriction.Z * FrictionMultiplier

        Player.Speed = Player.Speed.add(Player.Speed.mul(Player.Physics.AirResist)).add(new Vector3(PhysicsHandler.GetDecel(Player.Speed.X, XFriction), 0, PhysicsHandler.GetDecel(Player.Speed.Z, ZFriction)))
    },

    /**
     * Replacement function for `AccelerateGrounded` and `AccelerateAirborne` for the `Roll` state, disables acceleration and keeps speed
     * @param Player 
     */
    RollInertia: (Player: Player) => {
        // TODO: see if i can seperate the gravity from this
        const Weight = Player.Physics.Weight
        let Acceleration = Player.ToLocal(Player.Flags.Gravity.mul(Weight))

        if (Player.Ground.Grounded && Player.Speed.X > Player.Physics.RunSpeed && Player.Ground.DotProduct < 0) {
            // TODO: make dynamic
            Acceleration = Acceleration.mul(new Vector3(1, -8, 1))
        }

        if (Player.Flags.BallEnabled && Player.Ground.DotProduct < .98) {
            Acceleration = Acceleration.add(new Vector3(Player.Speed.X * -.0002, 0, 0))
        } else {
            Acceleration = Acceleration.add(new Vector3(Player.Speed.X * Player.Physics.AirResist.X, 0, 0))
        }

        Acceleration = Acceleration.add(new Vector3(0, Player.Speed.Y, Player.Speed.Z).mul(Player.Physics.AirResist.Z))

        Player.Speed = Player.Speed.add(Acceleration)
    },

    // Turning
    /**
     * Raw turning function used in the main Player.Turn function, will directly rotate the Players Y axis
     * 
     * Do not use over Player.Turn unless you want a snap turn!
     * @param Player 
     * @param Turn Amount in radians to turn
     */
    TurnRaw: (Player: Player, Turn: number) => {
        Player.Angle = Player.Angle.mul(CFrame.Angles(0, Turn, 0))
    },

    /**
     * Turning function, limits max angle to smooth out turns, use over `TurnRaw`
     * 
     * `IState` Options:
     * 
     *      undefined - Regular turning, variable max turn
     *      InertiaState.FULL_INERTIA - Max turning limited to 45, turns with 100% inertia
     *      InertiaState.GROUND_NOFRICT - Similar to undefined calculations, but assumes grounded & ignores low friction
     * 
     * @param Player 
     * @param Turn Amount in radians to turn
     * @param IState Inertia configs to match Digital Swirl
     */
    Turn: (Player: Player, Turn: number, IState: IntertiaState | undefined) => {
        let MaxTurn = math.abs(Turn)
        const [HasControl] = Player.Input.Get(Player)
        const PreviousSpeed = Player.ToGlobal(Player.Speed)

        /*
            UNDEFINED: Y
            FULL_INERTIA: YQ
            GROUND_NOFRICT: YS
        */
        if (IState === undefined) { // cannot do !IState?
            if (MaxTurn <= math.rad(45)) {
                if (MaxTurn <= math.rad(22.5)) {
                    MaxTurn /= 8
                } else {
                    MaxTurn /= 4
                }
            } else {
                MaxTurn = math.rad(11.25)
            }
        } else if (IState === IntertiaState.FULL_INERTIA) {
            MaxTurn = math.clamp(Turn, math.rad(-45), math.rad(45))
        } else if (IState === IntertiaState.GROUND_NOFRICT) {
            MaxTurn = math.rad(1.40625)
            if (Player.Speed.X > Player.Physics.DashSpeed) {
                MaxTurn = math.max(MaxTurn - (math.sqrt(((Player.Speed.X - Player.Physics.DashSpeed) * 0.0625)) * MaxTurn), 0)
            }
        }

        MaxTurn = math.abs(MaxTurn)

        //Turn
        PhysicsHandler.TurnRaw(Player, math.clamp(Turn, -MaxTurn, MaxTurn))

        if (IState === undefined) {
            if (Player.Ground.Grounded) {
                Player.Speed = Player.Speed.mul(.1).add(Player.ToLocal(PreviousSpeed).mul(.9))
            } else {
                let Inertia

                if (HasControl) {
                    if (Player.Ground.DotProduct <= .4) {
                        Inertia = .5
                    } else {
                        Inertia = .01
                    }
                } else {
                    Inertia = .95
                }

                /*
                if self.frict_mult < 1 then
                    inertia *= self.frict_mult
                end
                */

                Player.Speed = Player.Speed.mul(1 - Inertia).add(Player.ToLocal(PreviousSpeed).mul(Inertia))
            }
        } else if (IState === IntertiaState.FULL_INERTIA) {
            Player.Speed = Player.ToLocal(PreviousSpeed)
        } else if (IState === IntertiaState.GROUND_NOFRICT) {
            let Inertia
            if (Player.Ground.DotProduct <= .4) {
                Inertia = .5
            } else {
                Inertia = .01
            }

            Player.Speed = Player.Speed.mul(1 - Inertia).add(Player.ToLocal(PreviousSpeed).mul(Inertia))
        }

    },

    /**
     * Deceleration calculation
     * 
     * @param Speed Number to decelerate
     * @param Deceleration Maximum deceleration rate
     * @returns Applied deceleration speed
     */
    GetDecel(Speed: number, Deceleration: number) {
        if (Speed > 0) {
            return -math.min(Speed, -Deceleration)
        } else if (Speed < 0) {
            return math.min(-Speed, -Deceleration)
        }
        return 0
    }
}