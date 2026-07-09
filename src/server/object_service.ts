import { type OnInit, Service } from "@flamework/core";
import { CollectionService, HttpService, ServerStorage } from "@rbxts/services";
import { workspace } from "shared/common/globals";

@Service()
export class ObjectService implements OnInit {
	public onInit() {
		(CollectionService.GetTagged("Object") as Model[]).forEach((Model) => {
			Model.SetAttribute("UniqueID", HttpService.GenerateGUID(false));
			task.spawn(() => this.ReplaceModels(Model));
		});
		CollectionService.GetTagged("_DEBUG").forEach((I) => I.Destroy());

		const Rails = workspace.Level.Rails.GetDescendants();
		Rails.forEach((Model) => {
			if (Model.IsA("Model")) Model.SetAttribute("UniqueID", HttpService.GenerateGUID(false));
		});
		Rails.forEach((Part) => {
			if (Part.IsA("Part")) {
				const Model = Part.FindFirstAncestorOfClass("Model");
				if (Model) Part.SetAttribute("UniqueID", Model.GetAttribute("UniqueID"));
				else Part.SetAttribute("UniqueID", HttpService.GenerateGUID(false));
			}
		});
	}

	public ReplaceModels(Object: Model) {
		const ObjectType = Object.Name;
		let Model = (ServerStorage as typeof ServerStorage & { ObjectModels: Folder }).ObjectModels.FindFirstChild(ObjectType) as Model;
		if (!Model) return;

		Model = Model.Clone();
		Model.Parent = Object;
		Model.PivotTo(Object.GetPivot());
		Model.Name = "ObjectModel";
		if (Object.PrimaryPart) Object.PrimaryPart!.Transparency = 1;

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
