import { Component } from "@flamework/components";
import type { Client } from "framework";
import BaseObject from "../baseobj";

/**
 * @class
 * @object
 * @augments BaseObject
 */
@Component({ tag: "CameraSetter" })
export class CameraSetter extends BaseObject<Model> {
	public OnStart() {}

	public OnTouch(Client: Client) {
		const [X, Y, Z] = this.Root.CFrame.ToOrientation();
		Client.Camera.Rotation.X = X;
		Client.Camera.Rotation.Y = Y;
		Client.Camera.Rotation.Z = Z;

		this.Debounce = 5 * 60;
	}
}
