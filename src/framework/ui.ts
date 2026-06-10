import ReactRoblox from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";

/**
 * @class
 */
export class UIMain {
	public Domain;
	public Root;

	constructor() {
		this.Domain = new Instance("ScreenGui", Players.LocalPlayer.WaitForChild("PlayerGui"));
		this.Domain.Name = "Main";
		this.Domain.IgnoreGuiInset = true;
		this.Domain.ResetOnSpawn = false;

		this.Root = ReactRoblox.createRoot(this.Domain);
	}
}
