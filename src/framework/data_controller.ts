import { Controller, type OnStart } from "@flamework/core";
import { type DataFormat, DataTemplate } from "shared/common/data";
import { ClientEvents } from "./client_networking";

@Controller()
export class DataController implements OnStart {
	public Data: DataFormat = DataTemplate;
	public onStart() {
		ClientEvents.ReplicateProfile.connect((Data) => (this.Data = Data));
	}
}
