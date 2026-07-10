import { Dependency } from "@flamework/core";
import { type Atom, atom } from "@rbxts/charm";
import { useFlameworkDependency } from "@rbxts/flamework-react-utils";
// biome-ignore lint/correctness/noUnusedImports: <React>
import React, { useEffect, useMemo } from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { Trash } from "@rbxts/trash";
import { Nav } from "framework/control/input";
import type { SoundController } from "framework/draw/sound";
import { RestartLevelSignal } from "shared/common/globals";

const PauseOptions = ["Resume", "Restart", "Options", "Controls", "Characters", "Return To Title"] as const;
const Callbacks: { [Key in (typeof PauseOptions)[number]]: (WindowAtom: Atom<"Settings" | "Pause" | "Controls" | "Characters" | undefined>) => void } = {
	Resume: (WindowAtom) => {
		Dependency<SoundController>().Play("UI/WindowClose");
		WindowAtom(undefined);
	},
	Restart: (WindowAtom) => {
		Dependency<SoundController>().Play("UI/WindowClose");
		WindowAtom(undefined);
		RestartLevelSignal.Fire();
	},
	Options: (WindowAtom) => {
		Dependency<SoundController>().Play("UI/PauseOptionSelect");
		WindowAtom("Settings");
	},
	Controls: (WindowAtom) => {
		Dependency<SoundController>().Play("UI/PauseOptionSelect");
		WindowAtom("Controls");
	},
	Characters: (WindowAtom) => {
		Dependency<SoundController>().Play("UI/PauseOptionSelect");
		WindowAtom("Characters");
	},
	"Return To Title": () => {
		Dependency<SoundController>().Play("UI/ToMenu");
		//TODO: return to title
		error("TODO! if this makes it into the release build: Oops!");
	},
};

export const PauseSelectedItemAtom = atom<(typeof PauseOptions)[number] | undefined>(undefined);
function MenuItem({
	Index,
	Option,
	WindowAtom,
}: {
	Index: number;
	Option: (typeof PauseOptions)[number];
	WindowAtom: Atom<"Settings" | "Pause" | "Controls" | "Characters" | undefined>;
}) {
	const CurrentSelection = useAtom(PauseSelectedItemAtom);
	const Selected = CurrentSelection === Option;

	return (
		<frame
			key="Item"
			BorderSizePixel={0}
			BackgroundTransparency={Selected ? 0 : 1}
			Size={UDim2.fromScale(1, 0.125)}
			BackgroundColor3={new Color3(1, 1, 1)}
			LayoutOrder={Index}
			Event={{
				MouseEnter: () => {
					PauseSelectedItemAtom(Option);
					Dependency<SoundController>().Play("UI/PauseOptionChange");
				},
				MouseLeave: () => {
					if (PauseSelectedItemAtom() === Option) PauseSelectedItemAtom(undefined);
				},
			}}
		>
			{Selected && (
				<uigradient
					key="UIGradient"
					Rotation={10}
					Transparency={
						new NumberSequence([
							new NumberSequenceKeypoint(0, 1, 0),
							new NumberSequenceKeypoint(0.3203, 0.8062, 0),
							new NumberSequenceKeypoint(0.703, 0.8062, 0),
							new NumberSequenceKeypoint(1, 1, 0),
						])
					}
				/>
			)}

			<textlabel
				key="Title"
				TextWrapped={true}
				BorderSizePixel={0}
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://16658246179", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				Text={Option.upper()}
				TextScaled={true}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={14}
				Size={UDim2.fromScale(1, 1)}
			/>
			<textbutton
				key="Button"
				ZIndex={99}
				BorderSizePixel={0}
				TextTransparency={1}
				Size={UDim2.fromScale(1, 1)}
				FontFace={new Font("rbxasset://fonts/families/SourceSansPro.json", Enum.FontWeight.Regular, Enum.FontStyle.Normal)}
				BackgroundTransparency={1}
				TextColor3={Color3.fromRGB(0, 0, 0)}
				Text={""}
				TextSize={14}
				Event={{
					MouseButton1Click: () => Callbacks[Option](WindowAtom),
				}}
			/>
		</frame>
	);
}

export function PauseMenu({ WindowAtom, CharacterColor }: { WindowAtom: Atom<"Settings" | "Pause" | "Controls" | "Characters" | undefined>; CharacterColor: Color3 }) {
	const SoundController = useFlameworkDependency<SoundController>();

	const Items = useMemo(() => {
		const Output = [];

		for (const [Index, Option] of pairs(PauseOptions)) {
			Output.push(<MenuItem Index={Index} Option={Option} WindowAtom={WindowAtom} />);
		}

		return Output;
	}, [PauseOptions]);

	useEffect(() => {
		SoundController.Play("UI/PauseOpen");

		const Connections = new Trash();

		function Navigate(Direction: number, Default: (typeof PauseOptions)[number]) {
			const Option = PauseSelectedItemAtom();
			const OptionsSize = PauseOptions.size();

			if (Option) {
				const Next = (PauseOptions.indexOf(Option) + Direction) % OptionsSize;
				PauseSelectedItemAtom(PauseOptions[Next]);
			} else PauseSelectedItemAtom(Default);

			SoundController.Play("UI/PauseOptionChange");
		}

		Connections.add(Nav.OnNavigateUp.Connect(() => Navigate(-1, PauseOptions[PauseOptions.size() - 2])));
		Connections.add(Nav.OnNavigateDown.Connect(() => Navigate(1, PauseOptions[0])));
		Connections.add(
			Nav.OnNavigateSelect.Connect(() => {
				const Option = PauseSelectedItemAtom();
				if (!Option) return;

				Callbacks[Option](WindowAtom);
			}),
		);
		Connections.add(
			Nav.OnNavigateBack.Connect(() => {
				WindowAtom(undefined);
			}),
		);

		return () => Connections.destroy();
	}, []);

	return (
		<imagelabel
			key="Pause"
			BorderSizePixel={0}
			Position={UDim2.fromScale(0.5, 0.5)}
			BackgroundTransparency={1}
			AnchorPoint={new Vector2(0.5, 0.5)}
			Image={"rbxassetid://133484049539824"}
			Size={UDim2.fromScale(0.6, 0.6)}
		>
			<uiaspectratioconstraint key="UIAspectRatioConstraint" AspectRatio={0.8194} />
			<imagelabel
				key="Glow"
				BorderSizePixel={0}
				Position={UDim2.fromScale(0.5, 0.5)}
				BackgroundTransparency={1}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Image={"rbxassetid://119113541658864"}
				Size={UDim2.fromScale(1, 1)}
				ImageColor3={CharacterColor}
			/>
			<scrollingframe
				key="Contents"
				ScrollingDirection={Enum.ScrollingDirection.Y}
				BorderSizePixel={0}
				CanvasSize={new UDim2()}
				BackgroundTransparency={1}
				Active={true}
				ScrollBarThickness={2}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Size={UDim2.fromScale(0.8, 0.8)}
				AutomaticCanvasSize={Enum.AutomaticSize.Y}
				Position={UDim2.fromScale(0.5, 0.5)}
			>
				{Items}
				<uilistlayout key="UIListLayout" SortOrder={Enum.SortOrder.LayoutOrder} Padding={new UDim(0, 10)} />
			</scrollingframe>
		</imagelabel>
	);
}
