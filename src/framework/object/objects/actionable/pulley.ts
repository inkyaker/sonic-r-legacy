import { Component } from "@flamework/components";
import type { Client } from "framework";
import BaseObject from "../baseobj";

/**
 * @class
 * @object
 * @augments BaseObject
 */
@Component({ tag: "Pulley" })
export class Pulley extends BaseObject<Model> {
	public OnTouch(Client: Client) {
		Client.Respawn();
	}
}
