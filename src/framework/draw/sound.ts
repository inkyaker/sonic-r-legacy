import { Controller } from "@flamework/core";
import { ReplicatedStorage, SoundService } from "@rbxts/services";
import type { Client } from "framework";
import { CollisionParams } from "framework/physics/collision";
import { GetAttribute } from "shared/common/class/attributes";
import { PickFromArray, workspace } from "shared/common/globals";

//TODO: implement origin point & distance lol
type PlayConfig = {
	/**
	 * If `undefined` or `false`, all other instances of this sound will be deleted
	 */
	MultiChannel?: boolean;

	/**
	 * Setting this to a `Vector3` will fade out audio depending on camera distance to `OriginPoint`, with volume 0 being `SoundRange`
	 */
	OriginPoint?: Vector3;
	SoundRange?: number;

	BoundState?: string;

	Volume?: number;
};

type StopConfig = {
	/**
	 * Stopping a sound by name will stop all sounds under that name, use this to stop only a specific sound
	 */
	Target?: Sound;
};

const FootstepMaterials = ["Snow", "Stone"] as const;
const SoundMaterialMap: { [Key in Enum.Material["Name"]]?: (typeof FootstepMaterials)[number] } = {
	Plastic: "Stone",
	SmoothPlastic: "Stone",
	Sandstone: "Stone",
	Rock: "Stone",
	Slate: "Stone",

	Snow: "Snow",
	Salt: "Snow",
	Sand: "Snow",
	Ground: "Snow",
};

@Controller()
export class SoundController {
	public Assets;
	public Registry: Sound[] = [];

	constructor() {
		this.Assets = ReplicatedStorage.WaitForChild("Assets").WaitForChild("Sounds") as Folder;
	}

	public Play(Path: string, Config?: PlayConfig): Sound {
		if (!Config) {
			Config = {};
		}

		let Sound = this.PathToSound(Path);

		if (!Sound) {
			error(`Unable to find sound at ${Path}!`);
		}

		Sound = Sound.Clone();
		Sound.Parent = SoundService;

		if (Config.Volume) Sound.Volume = Config.Volume;

		if (Config.BoundState) Sound.SetAttribute("BoundState", Config.BoundState);

		if (!Config.MultiChannel) {
			for (const [Index, Target] of pairs(this.Registry)) {
				if (Target.GetAttribute("Class") === Sound.GetAttribute("Class")) {
					Target.Destroy();
					delete this.Registry[Index - 1];
				}
			}
		}

		this.Registry.push(Sound);

		task.spawn(() => {
			if (!Sound.IsLoaded) Sound.Loaded.Wait();

			Sound.Play();

			if (Sound.Looped) return;
			task.wait(Sound.TimeLength);

			if (Sound && Sound.Parent === SoundService) Sound.Destroy();
		});

		return Sound;
	}

	public Stop(Path: string, Config?: StopConfig) {
		if (!Config) Config = {};

		const Sound = Config.Target || this.PathToSound(Path);
		if (!Sound) return;

		const Class = Sound.GetAttribute("Class");
		return this.Registry.find((Source, Index) => {
			if ((Sound && Source === Sound) || Source.GetAttribute("Class") === Class) {
				Source.Destroy();
				this.Registry[Index] = undefined as unknown as Sound;

				return true;
			}
		});
	}

	public StopAllSounds() {
		for (const [Index, Target] of pairs(this.Registry)) {
			Target.Destroy();
			this.Registry[Index - 1] = undefined as unknown as Sound;
		}
	}

	public PathToSound(Path: string): Sound | undefined {
		const Splits = string.split(Path, "/");
		let Root: Instance | undefined = this.Assets;

		for (const [Index, Next] of pairs(Splits)) {
			if (!Root) break;
			Root = Root.FindFirstChild(Next);

			if (!Root || Root.IsA("Sound")) break;
			if (Index === Splits.size() && Root.IsA("Folder")) Root = PickFromArray(Root.GetChildren()) as Sound;
		}

		if (Root?.IsA("Sound")) GetAttribute(Root, "Class", Root.Name);

		return Root as Sound | undefined;
	}

	public Update(Current: string) {
		for (const [Index, Sound] of pairs(this.Registry)) {
			let State = Sound.GetAttribute("BoundState");

			if (State && State !== Current) {
				Sound.Destroy();
				delete this.Registry[Index - 1];
			} else if (Sound.Parent !== SoundService) delete this.Registry[Index - 1];
		}
	}

	/**
	 * Calculate and play footstep sound
	 * - in here for organization.
	 * @param Client
	 */
	public FootstepSound(Client: Client) {
		const Cast = workspace.Raycast(
			Client.GetMiddle(),
			Client.GetYOffset()
				.mul(-1)
				.add(Client.Angle.UpVector.mul(-1).mul(2 * Client.Config.Scale)),
			CollisionParams,
		);
		if (!Cast) return;

		const Type = SoundMaterialMap[Cast.Material.Name] ?? "Stone";
		this.Play(`Footstep/${Type}`, {
			MultiChannel: true,
		});

		const Attachment = Client.Effects.SpawnEffect("FootstepGeneric", new CFrame(Cast.Position.add(Cast.Normal.mul(1.5))));
		Attachment.FindFirstChildOfClass("ParticleEmitter")!.Color = new ColorSequence(Cast.Instance.Color);
	}
}
