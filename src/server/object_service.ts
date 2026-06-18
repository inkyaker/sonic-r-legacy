import { type OnInit, Service } from "@flamework/core";
import { CollectionService, HttpService } from "@rbxts/services";

@Service()
export class ObjectService implements OnInit {
	public onInit() {
		(CollectionService.GetTagged("Object") as Model[]).forEach((Model) => Model.SetAttribute("UniqueID", HttpService.GenerateGUID(false)));
	}
}
