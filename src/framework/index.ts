import { BaseComponent, Component } from "@flamework/components";
import type { OnStart } from "@flamework/core";
import { HttpService, Players, ReplicatedStorage } from "@rbxts/services";
import { CharacterInfo } from "shared/characterinfo";
import { Constants } from "shared/common/constants";
import type { CharacterType } from "shared/common/data";
import { FrameworkState } from "shared/common/frameworkstate";
import { workspace } from "shared/common/globals";
import type { RS } from "shared/common/types";
import { FromToRotation } from "shared/common/utility/cfutil";
import { AddLog } from "shared/common/utility/logger";
import * as Render from "shared/common/utility/renderregistry";
import { PlaneProject } from "shared/common/utility/vutil";
import type { GameController } from "shared/loader.server";
import { ClientEvents } from "./client_networking";
import { Input } from "./control/input";
import { AnimationController } from "./draw/animation";
import { Camera } from "./draw/camera";
import type { EffectController } from "./draw/effect_controller";
import { PackDrawInfo, Renderer } from "./draw/renderer";
import { SoundController } from "./draw/sound";
import { Rail, SetRail } from "./modules/rail";
import type BaseObject from "./object/objects/baseobj";
import { StateMachine } from "./statemachine";
import type { UIController } from "./ui/ui_controller";

const Player = Players.LocalPlayer;
const PI = math.pi;
const TAU = PI * 2;

/**
 * Flags list
 * @class
 */
class Flags {
	public LastUp = Vector3.yAxis;

	/**
	 * Does not control the `JumpBall` or `Roll`, view {@link EnterBall} for more info
	 */
	public BallEnabled = false;
	public TrailEnabled = false;

	// Damage
	public HurtTime = 0;
	public Invulnerability = 0;

	public Gravity = new Vector3(0, -1, 0);

	// Moves
	/**
	 * Timer to reduce gravity while holding `Client.Input.Button.Jump`
	 */
	public JumpTimer = 0;
	public SpindashSpeed = 0;
	public Bounces = 0;
	public InBounce = false;

	/**
	 * Amount of ticks input should be locked for
	 */
	public LockTimer = 0;
	/**
	 * Cancels out gravity while `Client.LockTimer > 0`
	 */
	public DirectVelocity = false;
	public ForceKeepTime = 0;
	public InWater = false; // TODO: implement water

	public _BoostTicked = false;
	public Boosting = false;
	public BoostTicks = 0;
}

/**
 * Item/Collection state
 * @class
 * @ClientComponent
 */
class GameState {
	constructor(Client: Client) {
		Client.UI.Rings(this.Rings);
		Client.UI.Score(this.Score);
		Client.UI.ScoreMult(this.Mult);
	}

	public Shield: string = "";
	public Power: string = "";
	public Rings = 0;
	public Score = 0;

	/**
	 * set automatically as an addition of all other mult types
	 */
	public Mult = 1;

	/**
	 * score multiplier tied directly to rings, decremented on damage, increased for every 10 rings gotten
	 */
	public RingMult = 0;

	/**
	 * direct score multiplier based on objects, decrements by 1 every 2.5 seconds and after 5 cycles will fully expire and reset
	 */
	public DirectMult = 0;
	private LastDirectMult = 0;
	private DirectMultFails = 0;

	// UI
	private LastRings = 0;
	private LastScore = 0;
	private LastMult = 0;

	public AddScore(Change: number) {
		this.Score += Change * this.Mult;
		if (Change < 0) this.ResetMult();
	}

	public AddRings(Change: number) {
		this.Rings += Change;

		const Mult = math.floor(this.Rings / 10);
		if (this.RingMult !== Mult) {
			this.RingMult = Mult;
			this.UpdateMult();
		}
	}

	public UpdateMult() {
		this.Mult = 1 + (this.DirectMult + this.RingMult);
	}

	public ResetMult() {
		this.DirectMult = 0;
		this.RingMult = 0;
		this.UpdateMult();
	}

	public AddMult(Change: number) {
		this.DirectMult = math.max(this.DirectMult + Change, 0);
		if (Change > 0) this.DirectMultFails = 0;

		this.LastDirectMult = os.clock();
		this.UpdateMult();
	}

	public Update(Client: Client) {
		if (this.DirectMult > 0 && os.clock() - this.LastDirectMult >= 2.5) {
			this.DirectMultFails++;

			if (this.DirectMultFails >= 5) {
				this.DirectMult = 0;
				this.DirectMultFails = 0;
				this.UpdateMult();
			} else this.AddMult(-1);
		}

		if (this.LastRings !== this.Rings) {
			this.LastRings = this.Rings;
			Client.UI.Rings(this.Rings);
		}

		if (this.LastScore !== this.Score) {
			this.LastScore = this.Score;
			Client.UI.Score(this.Score);
		}

		if (this.LastMult !== this.Mult) {
			this.LastMult = this.Mult;
			Client.UI.ScoreMult(this.Mult);
		}
	}
}

/**
 * Ground interaction container
 * @class
 * @ClientComponent
 */
class Ground {
	public Grounded: boolean = false;
	public Floor: BasePart | undefined;
	public FloorLast: CFrame | undefined;
	public FloorOffset: CFrame | undefined;
	public FloorSpeed: Vector3 = Vector3.zero;

	/**
	 * Dot product between `Client.Angle.UpVector` and `Client.Flags.Gravity`
	 */
	public DotProduct: number = -1;

	public UngroundedFrames: number = 0;
}

/**
 * Homing attack container
 * @class
 * @ClientComponent
 */
class HomingAttack {
	public Target: BaseObject<Model> | undefined;
	public Timer: number = 0;
	public Speed: number = 0;
}

/**
 * Client
 * @class
 */
@Component()
export class Client extends BaseComponent<{ CharacterType: CharacterType }, Model & { Humanoid: Humanoid }> implements OnStart {
	// Main
	public Character!: Model;
	public Humanoid!: Humanoid;
	public Root!: Part;
	public Position!: Vector3;
	public Speed!: Vector3;
	public Angle!: CFrame;
	public LastCFrame!: CFrame;
	public CurrentCFrame!: CFrame;
	public RenderCFrame!: CFrame;
	public PreviousAngle!: CFrame;

	// Flags
	public Flags!: Flags;

	// Character info
	public Config!: (typeof CharacterInfo)["Config"];
	public Animations!: (typeof CharacterInfo)["Animations"];

	// Modules
	public State!: StateMachine;
	public Camera!: Camera;
	public Animation!: AnimationController;
	public Renderer!: Renderer;
	public Input!: Input;
	public Rail!: Rail;
	public Sound!: SoundController;

	// Components
	public Ground!: Ground;
	public GameState!: GameState;
	public HomingAttack!: HomingAttack;

	constructor(
		public Controller: GameController,
		public UI: UIController,
		public Effects: EffectController,
	) {
		super();

		this.Controller.Object.Respawn();
	}

	public onStart() {
		this.Character = this.instance;
		this.Humanoid = this.Character.WaitForChild("Humanoid") as Humanoid;
		this.Root = this.Character.PrimaryPart! as Part;
		this.Position = this.Character.GetPivot().Position;
		this.Angle = this.Character.GetPivot().Rotation;
		this.Speed = Vector3.zero;

		this.LastCFrame = this.Angle.add(this.Position);
		this.CurrentCFrame = this.LastCFrame;
		this.RenderCFrame = this.CurrentCFrame;

		this.Config = CharacterInfo.Config;
		this.Animations = CharacterInfo.Animations;

		this.State = new StateMachine(this);
		this.Animation = new AnimationController(this);
		this.Camera = new Camera(this);
		this.Renderer = new Renderer(this.attributes.CharacterType);
		this.Input = new Input(this);
		this.Rail = new Rail();
		this.Sound = new SoundController();

		this.Ground = new Ground();

		this.Flags = new Flags();
		this.GameState = new GameState(this);
		this.HomingAttack = new HomingAttack();

		Render.RegisterStepped("Client", Enum.RenderPriority.Input.Value + 1, (DeltaTime) => this.Update(DeltaTime));

		this.PreviousAngle = CFrame.identity;
		this.UI.CharacterType(this.attributes.CharacterType);

		AddLog(`Loaded new Client ${this.Character}`);
	}

	/**
	 * Destroys the Client
	 */
	public Destroy() {
		this.Sound.Destroy();
	}

	/**
	 * Update Client once per frame, **do not run this method if you do not know what you're doing!**
	 */
	public Update(DeltaTime: number) {
		if (Player.GameplayPaused) return;

		if (this.PreviousAngle !== this.Angle) {
			// Angle reset
			this.SetGroundRelative();
			this.PreviousAngle = this.Angle;
		}

		// Update state machine
		this.State.Update(DeltaTime);

		// Interpolate positions
		this.RenderCFrame = this.LastCFrame.Lerp(this.Angle.add(this.Position), this.State.TickTimer);

		const DrawInfo = PackDrawInfo(this);
		this.Renderer.DrawInfo = DrawInfo;
		this.Renderer.Draw(this.Character, DeltaTime);
		this.Camera.Update(DeltaTime);

		this.Sound.Update(this.State.Current.GetID());
		this.GameState.Update(this);

		this.Controller.Replicator.ReplicateSelf(DrawInfo);
		this.Controller.Replicator.Draw(DeltaTime);
	}

	// Utility functions
	/**
	 * Returns the Clients current CFrame
	 * @returns {CFrame}
	 */
	public GetCFrame() {
		return this.Angle.add(this.Position);
	}

	/**
	 * Convert a vector into a local space vector centered on the Client's {0,0,0}
	 *
	 * Mainly used for Client.Speed
	 * @param Vector Vector to convert
	 * @returns Local vector
	 */
	public ToLocal(Vector: Vector3) {
		return this.GetCFrame()
			.mul(CFrame.Angles(0, math.rad(90), 0))
			.VectorToObjectSpace(Vector);
	}

	/**
	 * Inverse of Client.ToLocal, converts a vector from Client local space to world space
	 *
	 * Mainly used for Client.Speed
	 * @param Vector Vector to convert
	 * @returns Global vector
	 */
	public ToGlobal(Vector: Vector3) {
		return this.GetCFrame()
			.mul(CFrame.Angles(0, math.rad(90), 0))
			.VectorToWorldSpace(Vector);
	}

	/**
	 * Sets client angle
	 * @param Angle Target angle
	 */
	public SetAngle(Angle: CFrame) {
		if (this.Ground.Grounded) {
			this.Angle = Angle;
		} else {
			this.Position = this.Position.add(this.GetCFrame().UpVector.mul(this.Config.Height * this.Config.Scale));
			this.Angle = Angle;
			this.Position = this.Position.sub(this.GetCFrame().UpVector.mul(this.Config.Height * this.Config.Scale));
		}

		this.Ground.DotProduct = this.GetCFrame().UpVector.mul(-1).Dot(this.Flags.Gravity);
	}

	/**
	 * Get the scripted center of the Client
	 * @returns Client center position
	 */
	public GetMiddle() {
		return this.Position.add(this.GetYOffset());
	}

	/**
	 * Get the player height to middle
	 * @returns Offset to reach middle
	 */
	public GetYOffset() {
		return this.Angle.UpVector.mul(this.Config.Height * this.Config.Scale);
	}

	/**
	 * !! THIS METHOD IS AUTOMATICALLY RAN ON Client.ANGLE CHANGE !!
	 *
	 *
	 * Updates Client.Ground.DotProduct (Dot product of Client.Angle and Client.Flags.Gravity)
	 */
	public SetGroundRelative() {
		this.Ground.DotProduct = this.Angle.UpVector.mul(-1).Dot(this.Flags.Gravity.Unit);
	}

	/**
	 * Forces Client into ball
	 *
	 * `JumpBall` will be automatically triggered if Animation is `Roll` `and Client.Flags.BallEnabled === true`
	 */
	public EnterBall() {
		this.ExitBall();

		this.Flags.TrailEnabled = false;
		this.Flags.BallEnabled = true;
	}

	/**
	 * Exits the Clients current ball, check {@link EnterBall} for `Roll`/`JumpBall` rules
	 */
	public ExitBall() {
		this.Sound.Stop("Character/SpindashCharge");

		this.Flags.TrailEnabled = false;
		this.Flags.BallEnabled = false;
		this.Flags.InBounce = false;
	}

	/**
	 * Get client ball state
	 * @param Physical Should ball only be counted if the JumpBall would display
	 * @returns Logical ball state or physical ball state if `Physical` is `true`
	 */
	public InBall(Physical?: boolean) {
		return this.Flags.BallEnabled && (Physical ? ["Roll"].includes(this.Animation.Current) : true);
	}

	/**
	 * Helper method to cleanup all air-specific actions, run this when landed
	 */
	public Land() {
		this.ExitBall();
		this.Flags.Bounces = 0;
		this.Flags.InBounce = false;
		this.Flags.JumpTimer = 0;
	}

	/**
	 * Undoes the value changes from objects
	 */
	public ResetObjectState() {
		this.ExitBall();
		this.Flags.DirectVelocity = false;
		this.Flags.InBounce = false;
		this.Flags.LockTimer = 0;
		this.Rail.RailTrick = 0;
		this.Flags.JumpTimer = 0;

		SetRail(this);
	}

	/**
	 * Air resist when affected by water
	 */
	public GetAirResist() {
		return this.Config.AirResist.mul(new Vector3(1, (this.Flags.InWater && 1.5) || 1, 1));
	}

	/**
	 * Run acceleration when affected by water
	 */
	public GetRunAcceleration() {
		return this.Config.RunAcceleration * ((this.Flags.InWater && 0.65) || 1);
	}

	/**
	 * Weight when affected by water
	 */
	public GetWeight() {
		return this.Config.Weight * ((this.Flags.InWater && 0.45) || 1);
	}

	/**
	 * @returns DirectVelocity, Determines whether gravity is applied
	 */
	public IsScripted() {
		return (this.Flags.DirectVelocity && this.Flags.LockTimer > 0 && true) || false;
	}

	/**
	 * Damages the player and knocks them back
	 * @param Source Origin Position
	 */
	public Damage(Source: Vector3) {
		if (this.Flags.Invulnerability > 0) return;

		this.ResetObjectState();
		this.ExitBall();
		this.Flags.HurtTime = math.floor(0.65 * Constants.Tickrate);
		this.Flags.Invulnerability = math.floor(2.75 * Constants.Tickrate);
		this.State.Current = this.State.States.Hurt;
		this.Ground.Grounded = false;

		const [Direction] = PlaneProject(Source ? Source.sub(this.GetMiddle()) : this.Angle.LookVector, this.Flags.Gravity.Unit.mul(-1));

		if (Direction.Magnitude !== 0) {
			this.SetAngle(FromToRotation(this.Angle.LookVector, Direction.Unit).mul(this.Angle));
			this.Speed = this.ToLocal(Direction.Unit.mul(-1.75).add(Vector3.yAxis.mul(1.25)));
		} else this.Speed = this.ToLocal(this.Flags.Gravity.Unit.mul(-2.125));

		this.Animation.Current = "Hurt";

		if (this.GameState.Shield === "") {
			if (this.GameState.Rings > 0) {
				const Count = math.min(this.GameState.Rings, 25);
				for (const Index of $range(1, Count)) {
					const Angle = (TAU / Count) * Index;
					const Ring = (ReplicatedStorage as RS).Assets.Models.Object.SpilledRing.Clone();
					Ring.SetAttribute("UniqueID", HttpService.GenerateGUID(false));
					Ring.SetAttribute("Lifetime", 8 * Constants.Tickrate);
					Ring.PrimaryPart!.AssemblyLinearVelocity = CFrame.Angles(0, Angle, 0).LookVector.mul(1).add(Vector3.yAxis.mul(1));
					Ring.PivotTo(new CFrame(this.GetMiddle()));
					Ring.Parent = workspace.Level.Objects;
				}

				this.GameState.AddRings(-math.min(this.GameState.Rings, 150));
				this.Sound.Play("Character/RingLoss")
			} else this.State.States.Hurt.ShouldDie = true;
		} else this.GameState.Shield = "";

		return true;
	}

	/**
	 * Kill and respawn the character
	 * @param KeepLives If true, skip decrementing lives
	 */
	public Respawn(KeepLives?: boolean) {
		this.State.Current = this.State.States.None;

		if (!KeepLives) {
			let Lives = FrameworkState.Lives();

			if (Lives <= 1)
				// TODO: gameover
				Lives = 5;
			else Lives--;

			FrameworkState.Lives(Lives);
		}

		ClientEvents.Respawn();
	}
}
