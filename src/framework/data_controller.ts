import { Controller, type OnStart } from "@flamework/core";
import Signal from "@rbxts/lemon-signal";
import { type DataFormat, DataTemplate } from "shared/common/data";
import { ClientEvents } from "./client_networking";

@Controller()
export class DataController implements OnStart {
	/**
	 * ALL CLIENT DATA IS READONLY
	 * !! DO NOT MODIFY !!
	 */
	public Data: DataFormat = DataTemplate;
	public OnUpdate = new Signal();
	public HasLoaded = false;
	public onStart() {
		ClientEvents.ReplicateProfile.connect((Data) => {
			this.Data = Data;
			this.OnUpdate.Fire();
			this.HasLoaded = true;
		});
	}
}
