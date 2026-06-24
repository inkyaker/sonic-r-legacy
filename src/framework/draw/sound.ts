import { ReplicatedStorage, SoundService } from "@rbxts/services";
import { GetAttribute } from "shared/common/class/attributes";

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
};

type StopConfig = {
	/**
	 * Stopping a sound by name will stop all sounds under that name, use this to stop only a specific sound
	 */
	Target?: Sound;
};

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
		if (!Config) {
			Config = {};
		}

		const Sound = Config.Target || this.PathToSound(Path);
		if (!Sound) return;

		const Class = Sound.GetAttribute("Class");
		this.Registry.find((Source, Index) => {
			if ((Sound && Source === Sound) || Source.GetAttribute("Class") === Class) {
				Source.Destroy();
				this.Registry[Index] = undefined as unknown as Sound;

				return true;
			}
		});
	}

	public Destroy() {
		for (const [Index, Target] of pairs(this.Registry)) {
			Target.Destroy();
			this.Registry[Index - 1] = undefined as unknown as Sound;
		}
	}

	public PathToSound(Path: string): Sound | undefined {
		const Splits = string.split(Path, "/");
		let Root: Instance | undefined = this.Assets;

		for (const [_, Next] of pairs(Splits)) {
			if (!Root) break;
			Root = Root.FindFirstChild(Next);

			if (!Root || Root.IsA("Sound")) break;
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
}
