// TODO: completely remake this system

export type CharacterInfo = typeof CharacterInfo
export type AnimationList = typeof CharacterInfo.Animations
export type InferredAnimation = { [index:number]: { id: string; asset: AnimationTrack; pos:number|undefined }; }

let BaseAnimation:AnimationTrack = (undefined as unknown as AnimationTrack)

export let CharacterInfo = {
    Physics: {
        // Collision
        Height: 5,
        Scale: .6,
        Radius: 3,
        PositionError: 2,

        // Physics
        Weight: .08,

        // TODO: fix
        JogSpeed: .46,
        RunSpeed: 1.39,
		RollGetup: 1.39, // Point at which the roll state should uncurl you
        RushSpeed: 2.3,
        DashSpeed: 5.09,
		CrashSpeed: 3.7, // Used in Grounded's acceleration animation speed check

        RunAcceleration: .05,
        MaxXSpeed: 3,

        JumpInitalForce: 1.66,
        JumpHoldForce: .076,
        JumpTicks: 60,

        StandardDeceleration: -.06,

		SkidFriction: -.18,
		GroundFriction: new Vector3(-.1, 0, -.6),

        AirResist: new Vector3(-.008, -.01, -.4),

		// Moves
		HomingForce: {AirDash:5, HomingAttack:5}
    },

	Animations: {
		Idle: {
			[0]: { id:"120676159453993", asset: BaseAnimation }
		},
		Roll: {
			[0]: { id: "89521650226043", asset: BaseAnimation },
			spd_b: 1.5,
			spd_i: 0.65,
			spd_a: true
		},
		Spindash: {
			[0]: { id: "89521650226043", asset: BaseAnimation },
		},
		Fall: {
			[0]: { id: "106824283599126", asset: BaseAnimation }
		},
		Skid: {
			[0]: { id: "99388608469800", asset: BaseAnimation },
			end_anim: "Idle",
		},
		Run: {
			[0]: {
				id: "92382564179188",
				asset: BaseAnimation,
				pos: 0
			},
			[1]: {
				id: "72318789019564",
				asset: BaseAnimation,
				pos: 4
			}, 
			[2]: {
				id: "134508562899840",
				asset: BaseAnimation,
				pos: 6
			},
			spd_b: [.2, .2, .3],  // base speed
			spd_i: [.3, .3, .4], // speed incremental
			spd_a: false,
		},
	}
}


/*

local replicated_storage = game:GetService("ReplicatedStorage")
local assets = replicated_storage:WaitForChild("Assets")
local player = assets:WaitForChild("Player")

return {
	physics = {
		ball_trail_color = Color3.fromRGB(0, 0, 255),
		scale = .6,
		jump2_timer = 60,
		pos_error = 2,
		lim_h_spd = 16,
		lim_v_spd = 16,
		max_x_spd = 3,
		max_psh_spd = 0.6,
		jmp_y_spd = 1.66,
		nocon_spd = 3,
		slide_speed = 0.23,
		jog_speed = 0.46,
		run_speed = 1.39,
		rush_speed = 2.3,
		crash_speed = 3.7,
		dash_speed = 5.09,
		jmp_addit = 0.076,
		run_accel = 0.05,
		air_accel = 0.031,
		slow_down = -0.06,
		run_break = -0.18,
		air_break = -0.17,
		air_resist_air = -0.01,
		air_resist = -0.008,
		air_resist_y = -0.01,
		air_resist_z = -0.4,
		grd_frict = -0.1,
		grd_frict_z = -0.6,
		lim_frict = -0.2825,
		rat_bound = 0.3,
		rad = 3,
		height = 5,
		weight = 0.08,
		eyes_height = 7,
		center_height = 5.4,
		coyote_time = .15,
		air_max_speed = 6,
	},
	assets = player,
	animations = {
		Idle = {
			tracks = { {
				name = "Idle",
				id = "120676159453993"
			} }
		},
		Idle2 = {
			tracks = { {
				name = "Idle2",
				id = "132878115859327"
			} },
			end_anim = "Idle"
		},
		LandShortStill = {
			tracks = { {
				name = "LandShortStill",
				id = "84985275274473"
			} },
			end_anim = "Idle2"
		},
		HomingAttack = {
			tracks = { {
				name = "HomingAttack",
				id = "83146172775561"
			} },
			end_anim = "SpecialFall",
			anim_speed = true,
		},
		SpecialFall = {
			tracks = { {
				name = "SpecialFall",
				id = "116403189996931"
			} },
		},
		LandMoving = {
			tracks = { {
				name = "LandMoving",
				id = "116920139882842"
			} },
			end_anim = "Run",
			transitions = {
				all = .1,
			}
		},
		Run = {
			tracks = { 
				{
					name = "Jog2",
					id = "92382564179188",
					pos = 0
				},
				{
					name = "Run",
					id = "72318789019564",
					pos = 4
				}, 
				{
					name = "Jet",
					id = "73079985595263",
					pos = 6.5
				},	
			},
			spd_b = {.2, .2, .3},  -- base speed
			spd_i = {.3, .3, .4}, -- speed incremental
			spd_a = false,
			transitions = {
				LandMoving = .1,
			}
		},
		Skid = {
			tracks = { {
				name = "Skid",
				id = "99388608469800"
			} },
			end_anim = "SkidEnd"
		},
		SkidEnd = {
			tracks = { {
				name = "SkidEnd",
				id = "108027306781226"
			} },
			end_anim = "Idle2",
			transitions = {
				all = 0,
				Skid = 0,
			}
		},
		JumpMoving = {
			tracks = { {
				name = "JumpMoving",
				id = "103855062678356"
			} },
			spd = 1,
			end_anim = "Roll"
		},
		JumpStill = {
			tracks = { {
				name = "JumpStill",
				id = "114576643561141"
			} },
			spd = .7,
			end_anim = "Roll"
		},
		Roll = {
			tracks = { {
				name = "Roll",
				id = "89521650226043"
			} },
			spd_b = 1.5,
			spd_i = 0.65,
			spd_a = true
		},
		Spindash = {
			tracks = { {
				name = "Spindash",
				id = "106582015184532"
			} },
			spd_b = 1.5,
			spd_i = 0.65,
			spd_a = true,
			transitions = {
				all = 0,
			}
		},
		Fall = {
			tracks = { {
				name = "Fall",
				id = "106824283599126"
			} }
		},
		AirKick = {
			tracks = { {
				name = "AirKick",
				id = "0"
			} },
			end_anim = "Fall"
		},
		AirKickUp = {
			tracks = { {
				name = "AirKickUp",
				id = "0"
			} },
			end_anim = "Fall"
		},
		LSD = {
			tracks = { {
				name = "LSD",
				id = "0"
			} }
		},
		Hurt1 = {
			tracks = { {
				name = "Hurt1",
				id = "0"
			} },
			end_anim = "Fall"
		},
		Hurt2 = {
			tracks = { {
				name = "Hurt2",
				id = "0"
			} },
			end_anim = "Fall"
		},
		
		Rail_L = {
			tracks = { {
				name = "Rail_L",
				id = "103281797241307"
			} },
			spd_b = 0.125,
			spd_i = 0.5,
			spd_a = true
		},
		
		Rail_R = {
			tracks = { {
				name = "Rail_R",
				id = "93967315703739"
			} },
			spd_b = 0.125,
			spd_i = 0.5,
			spd_a = true
		},
		
		
		RailSwap_L_R = {
			tracks = { {
				name = "RailSwap_L_R",
				id = "122204375634398"
			} },
			end_anim = "Rail_R"
		},
		
		RailSwap_R_L = {
			tracks = { {
				name = "RailSwap_R_L",
				id = "131094461125191"
			} },
			end_anim = "Rail_L"
		},
		
		RailLand = {
			tracks = { {
				name = "RailLand",
				id = "0"
			} },
			end_anim = "Rail_R"
		},
		
		RailSwitchLeft_L = {
			tracks = { {
				name = "RailSwitchLeft_L",
				id = "0"
			} }
		},
		RailSwitchRight_L = {
			tracks = { {
				name = "RailSwitchRight_L",
				id = "0"
			} }
		},
		RailSwitchLeft_R = {
			tracks = { {
				name = "RailSwitchLeft_R",
				id = "0"
			} }
		},
		RailSwitchRight_R = {
			tracks = { {
				name = "RailSwitchRight_R",
				id = "0"
			} }
		},
		
		SpringStart = {
			tracks = { {
				name = "SpringStart",
				id = "0"
			} },
			end_anim = "Spring"
		},
		Spring = {
			tracks = { {
				name = "Spring",
				id = "0"
			} }
		},
		DashRamp = {
			tracks = { {
				name = "DashRamp",
				id = "0"
			} }
		},
		DashRing = {
			tracks = { {
				name = "DashRing",
				id = "0"
			} }
		},
		RainbowRing = {
			tracks = { {
				name = "RainbowRing",
				id = "0"
			} }
		},
		SwingPole = {
			tracks = {
				{
					name = "SwingPole",
					id = "130782712685709"
				}
			},
			anim_speed = true,
		},
		SwingPoleSuccess = {
			tracks = {
				{
					name = "SwingPoleSuccess",
					id = "132128804816688"
				}
			},
			end_anim = "SpecialFall",
		},
		RocketGrab = {
			tracks = {
				{
					name = "RocketGrab",
					id = "132924965224165"
				}
			},
			end_anim = "RocketLaunchLoop",
		},
		RocketLaunchLoop = {
			tracks = {
				{
					name = "RocketLaunchLoop",
					id = "81137156764728"
				}
			},
		},

		SpindashSpeed = 60,
		SpindashFrames = 6
	},
}
*/