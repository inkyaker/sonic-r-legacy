import { Controller, type OnStart } from "@flamework/core";
import { SoundService } from "shared/common/globals";

@Controller()
export class AudioController implements OnStart {
	public onStart() {
		this.RunMusicLoop();
	}

	public RunMusicLoop() {
		//TODO: fire now playing and improve loop
		const Songs = SoundService.QueryDescendants("Sound") as Sound[];

		while (true) {
			const Music = Songs[math.random(0, Songs.size() - 1)];
			Music.Play();
			Music.Stopped.Wait();
		}
	}
}
