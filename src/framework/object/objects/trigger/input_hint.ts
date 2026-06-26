import { Component } from "@flamework/components";
import type { Client } from "framework";
import BaseObject from "../baseobj";

/**
 * @class
 * @object
 * @augments BaseObject
 */
@Component({ tag: "InputHint" })
export class InputHint extends BaseObject<Model> {
	public TouchClient(Client: Client) {
		Client.UI.InputPopupAtom({
			Data: {
				Image: Client.Input.GetIconForButton(Client.Input.Button.Boost),
				Text: Client.Input.Button.Boost.DisplayName,
			},
			Duration: 3,
		});
		this.Debounce = 16;
	}
}
