import { Component } from "@flamework/components";
import type { Client } from "framework";
import type { ButtonState } from "framework/control/buttonstate";
import { Attributes } from "shared/common/class/attributes";
import BaseObject from "../baseobj";

type Data = { Button: string; DebugMode: boolean; IsHold: boolean };

/**
 * @class
 * @object
 * @augments BaseObject
 */
@Component({ tag: "InputHint" })
export class InputHint extends BaseObject<Model> {
	public Data!: Attributes<Data>;
	public OnStart() {
		this.Data = Attributes<Data>(this.Object);
		if (this.Data.DebugMode) this.Root.Transparency = 0.8;
	}

	public OnTouch(Client: Client) {
		const Button = (Client.Input.Button as Record<string, ButtonState | undefined>)[this.Data.Button];
		if (!Button) return;

		Client.UI.InputPopupAtom({
			Data: {
				Image: Client.Input.GetIconForButton(Button),
				Text: `${this.Data.IsHold ? "HOLD " : ""}${Button.DisplayName.upper()}`,
			},
			Duration: 4.25,
		});
		this.Debounce = 30;
	}
}
