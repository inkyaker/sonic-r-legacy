import { Component } from "@flamework/components";
import type { Client } from "framework";
import type { ButtonState } from "framework/control/buttonstate";
import { Attributes } from "shared/common/class/attributes";
import BaseObject from "../baseobj";

type Data = { Button: string };

/**
 * @class
 * @object
 * @augments BaseObject
 */
@Component({ tag: "InputHint" })
export class InputHint extends BaseObject<Model> {
	public Data!: Attributes<Data>;
	public Button!: string;
	public OnStart() {
		this.Data = Attributes<Data>(this.Object);

		this.Button = this.Data.Button;
		this.Connections.Add(this.Data("Button").Connect(() => (this.Button = this.Data.Button)));
	}

	public OnTouch(Client: Client) {
		const Button = (Client.Input.Button as Record<string, ButtonState | undefined>)[this.Button];
		if (!Button) return;

		Client.UI.InputPopupAtom({
			Data: {
				Image: Client.Input.GetIconForButton(Button),
				Text: Button.DisplayName,
			},
			Duration: 3,
		});
		this.Debounce = 30;
	}
}
