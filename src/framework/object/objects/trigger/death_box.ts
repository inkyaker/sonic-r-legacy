import { Component } from "@flamework/components";
import type { Client } from "framework";
import BaseObject from "../baseobj";

/**
 * @class
 * @object
 * @augments BaseObject
 */
@Component({ tag: "DeathBox" })
export class DeathBox extends BaseObject<Model> {
	public OnTouch(Client: Client) {
		Client.Respawn();
	}
}
