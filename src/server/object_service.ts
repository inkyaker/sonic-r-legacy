import { type OnInit, Service } from "@flamework/core";
import { CollectionService, HttpService, ServerStorage } from "@rbxts/services";

@Service()
export class ObjectService implements OnInit {
	public onInit() {
		(CollectionService.GetTagged("Object") as Model[]).forEach((Model) => {
			Model.SetAttribute("UniqueID", HttpService.GenerateGUID(false));
			task.spawn(() => this.ReplaceModels(Model));
		});
		CollectionService.GetTagged("_DEBUG").forEach((I) => I.Destroy());
	}

	public ReplaceModels(Object: Model) {
		const ObjectType = Object.Name;
		let Model = (ServerStorage as typeof ServerStorage & { ObjectModels: Folder }).ObjectModels.FindFirstChild(ObjectType) as Model;
		if (!Model) return;

		Model = Model.Clone();
		Model.Parent = Object;
		Model.PivotTo(Object.GetPivot());
		Model.Name = "ObjectModel";
		Object.PrimaryPart!.Transparency = 1;

		Model.GetDescendants()
			.filter((v) => v.IsA("BasePart"))
			.forEach((v) => {
				v.CanQuery = false;
				v.CanCollide = false;
				v.CanTouch = false;
				v.AudioCanCollide = false;
			});
	}
}
