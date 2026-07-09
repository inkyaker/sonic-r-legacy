/** biome-ignore-all lint/complexity/noUselessFragments: <useful fragment> */
import { Controller, type OnStart } from "@flamework/core";
import { type Atom, atom } from "@rbxts/charm";
import { useFlameworkDependency } from "@rbxts/flamework-react-utils";
import Signal from "@rbxts/lemon-signal";
import { useMotion, useMountEffect } from "@rbxts/pretty-react-hooks";
// biome-ignore lint/correctness/noUnusedImports: <react>
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { UserInputService } from "@rbxts/services";
import { Trash } from "@rbxts/trash";
import { SoundService, WindowAtom } from "shared/common/globals";
import { GetMeta, SettingsCategories, type SettingsData, SettingsKeys } from "shared/common/settings";
import { ClientEvents } from "./client_networking";
import { Nav, PlatformContextAtom } from "./control/input";
import type { DataController } from "./data_controller";

export const SettingsHoverAtom = atom<string | undefined>();
export const SettingsFocusAtom = atom<string | undefined>();
export const SettingsTabAtom = atom<string>("Audio");

function GetTabOrder(Input: string) {
	return SettingsCategories.indexOf(Input);
}

@Controller()
export class SettingsController implements OnStart {
	public DataLoaded = false;
	constructor(public Data: DataController) {}

	public onStart() {
		this.RefreshVolume();
		this.DataLoaded = true;
		this.Data.OnUpdate.Connect(() => {
			this.RefreshVolume();
		});
	}

	public RefreshVolume() {
		const Settings = this.Data.Data.Settings;
		SoundService.CharacterSFX.Volume = this.DataLoaded ? Settings.SFXVolume : 0;
		SoundService.FootstepSFX.Volume = this.DataLoaded ? Settings.FootstepVolume : 0;
		SoundService.Music.Volume = this.DataLoaded ? Settings.MusicVolume : 0;
		SoundService.ObjectSFX.Volume = this.DataLoaded ? Settings.ObjectSFXVolume : 0;
		SoundService.OtherCharacterSFX.Volume = this.DataLoaded ? Settings.OtherPlayerVolume : 0;
	}
}

function Tab({ TabName, Order, CharacterColor }: { TabName: string; Order: number; CharacterColor: Color3 }) {
	const Tab = useAtom(SettingsTabAtom);

	return (
		<frame LayoutOrder={Order} key={TabName} BorderSizePixel={0} BackgroundTransparency={1} AutomaticSize={Enum.AutomaticSize.X} Size={new UDim2(0, 0, 1, 0)}>
			<textbutton
				Transparency={1}
				Size={UDim2.fromScale(1, 1)}
				ZIndex={99}
				Event={{
					MouseButton1Click: () => SettingsTabAtom(TabName),
				}}
			/>
			<imagelabel
				key="Background"
				BorderSizePixel={0}
				SliceCenter={new Rect(129, 0, 895, 0)}
				BackgroundTransparency={1}
				Image={"rbxassetid://129298691928623"}
				Size={UDim2.fromScale(1, 1)}
				ScaleType={Enum.ScaleType.Slice}
				ImageTransparency={Tab === TabName ? 0.5 : 0}
				ImageColor3={Tab === TabName ? CharacterColor : new Color3(1, 1, 1)}
			/>
			<textlabel
				key="TabTitle"
				AutomaticSize={Enum.AutomaticSize.X}
				BorderSizePixel={0}
				TextXAlignment={Enum.TextXAlignment.Left}
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://16658246179", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				Text={TabName}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={28}
				Size={new UDim2(0, 0, 1, 0)}
			>
				<uipadding key="UIPadding" PaddingRight={new UDim(0, 20)} PaddingLeft={new UDim(0, 20)} PaddingBottom={new UDim(0, 5)} PaddingTop={new UDim(0, 5)} />
			</textlabel>
			<uipadding key="UIPadding" PaddingBottom={new UDim(0, 5)} PaddingTop={new UDim(0, 5)} />
		</frame>
	);
}

namespace Modes {
	export function Carousel({ SetChanged, Options, Signal, Key }: { SetChanged: (NewValue: unknown) => void; Value: string; Options: string[]; Signal: Signal; Key: string }) {
		const CurrentFocus = useAtom(SettingsFocusAtom);
		const Focused = Key === CurrentFocus;
		const ChangeValue = useCallback((Direction: -1 | 1) => {
			if (!LayoutRef.current) return;
			if (Direction === 1) LayoutRef.current.Next();
			else LayoutRef.current.Previous();

			SetChanged(Options[LayoutRef.current.CurrentPage!.LayoutOrder]);
		}, []);

		const OptionUIs = useMemo(() => {
			return Options.map((Value, Index) => (
				<textlabel
					key="Option"
					TextWrapped={true}
					BorderSizePixel={0}
					BackgroundTransparency={1}
					Active={true}
					FontFace={new Font("rbxassetid://16658246179", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					Text={Value}
					TextScaled={true}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextSize={14}
					Size={UDim2.fromScale(1, 1)}
					Selectable={true}
					LayoutOrder={Index}
				>
					<uipadding key="UIPadding" PaddingRight={new UDim(0.2, 0)} PaddingLeft={new UDim(0.2, 0)} />
				</textlabel>
			));
		}, [Options]);

		const LayoutRef = useRef<UIPageLayout>();

		useEffect(() => {
			const Connection = Signal.Connect(() => SettingsFocusAtom(Key));

			return () => Connection.Disconnect();
		}, []);

		useEffect(() => {
			if (!Focused) return;

			const Connections = new Trash();
			Connections.add(Nav.OnNavigateLeft.Connect(() => ChangeValue(-1)));
			Connections.add(Nav.OnNavigateRight.Connect(() => ChangeValue(1)));

			return () => Connections.destroy();
		}, [Focused]);

		return (
			<frame key="Carousel" BorderSizePixel={0} Position={new UDim2(-0.1, 0, 0, 0)} BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)} ClipsDescendants={true}>
				<frame key="Content" BorderSizePixel={0} BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}>
					<uipagelayout
						key="UIPageLayout"
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						EasingStyle={Enum.EasingStyle.Cubic}
						Circular={true}
						GamepadInputEnabled={false}
						ScrollWheelInputEnabled={false}
						EasingDirection={Enum.EasingDirection.InOut}
						TouchInputEnabled={false}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
						TweenTime={0.1}
						ref={LayoutRef}
					/>
					{OptionUIs}
				</frame>
				<textbutton
					Event={{
						MouseButton1Click: () => ChangeValue(1),
					}}
					key="Back"
					TextWrapped={true}
					ZIndex={99}
					BorderSizePixel={0}
					TextTransparency={0.5}
					Size={UDim2.fromScale(0.5, 1)}
					TextScaled={true}
					FontFace={new Font("rbxassetid://16658246179", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					BackgroundTransparency={1}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					Text={"<"}
					TextSize={14}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextStrokeColor3={Color3.fromRGB(255, 255, 255)}
				>
					<uitextsizeconstraint key="UITextSizeConstraint" MaxTextSize={30} />
				</textbutton>
				<textbutton
					Event={{
						MouseButton1Click: () => ChangeValue(-1),
					}}
					key="Forward"
					TextWrapped={true}
					ZIndex={99}
					BorderSizePixel={0}
					TextTransparency={0.5}
					Size={UDim2.fromScale(0.5, 1)}
					Position={new UDim2(1, 0, 0, 0)}
					TextScaled={true}
					FontFace={new Font("rbxassetid://16658246179", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					AnchorPoint={new Vector2(1, 0)}
					BackgroundTransparency={1}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					Text={">"}
					TextSize={14}
					TextXAlignment={Enum.TextXAlignment.Right}
				>
					<uitextsizeconstraint key="UITextSizeConstraint" MaxTextSize={30} />
				</textbutton>
			</frame>
		);
	}

	export function Toggle({ SetChanged, Value, Signal }: { SetChanged: (NewValue: unknown) => void; Value: unknown; Signal: Signal }) {
		useEffect(() => {
			const Connection = Signal.Connect(() => SetChanged(!Value));

			return () => Connection.Disconnect();
		}, [Value]);

		return (
			<textbutton
				key="Toggle"
				TextWrapped={true}
				BorderSizePixel={0}
				Size={UDim2.fromScale(1, 1)}
				TextScaled={true}
				FontFace={new Font("rbxassetid://16658246179", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				BackgroundTransparency={1}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				Text={Value ? "ON" : "OFF"}
				TextSize={14}
				Event={{
					MouseButton1Click: () => Signal.Fire(),
				}}
			/>
		);
	}

	export function Slider({
		Max,
		Value,
		DisplayFunc,
		Expanded,
	}: {
		SetChanged: (NewValue: unknown) => void;
		Min: number;
		Max: number;
		Increment: number;
		Value: number;
		Expanded: boolean;
		DisplayFunc?: (Value: number) => string;
		Key: string;
	}) {
		const [Size, Motion] = useMotion(1);
		useLayoutEffect(() => {
			Motion.tween(Expanded ? 0.5 : 1, {
				duration: 0.1,
				easing: "sineOut",
			});
		}, [Expanded]);

		return (
			<frame key="Slider" BorderSizePixel={0} BackgroundTransparency={1} Size={Size.map((Size) => UDim2.fromScale(1, Size))}>
				<textlabel
					key="Percentage"
					TextWrapped={true}
					BorderSizePixel={0}
					BackgroundTransparency={1}
					RichText={true}
					Active={true}
					FontFace={new Font("rbxassetid://16658246179", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
					Text={DisplayFunc ? DisplayFunc(Value) : `${math.round((Value / Max) * 100)}%`}
					TextScaled={true}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextSize={14}
					Size={UDim2.fromScale(1, 1)}
					Selectable={true}
					TextXAlignment={"Left"}
				/>
			</frame>
		);
	}
}

function Option({
	DisplayName,
	Type,
	Key,
	Atom,
	Signal,
	SetChanged,
	Order,
	Visible,
	CharacterColor,
}: {
	SetChanged: (NewValue: unknown) => void;
	DisplayName: string;
	Type: "Toggle" | "Carousel" | "Slider";
	Key: string;
	Atom: Atom<unknown>;
	Signal: Signal;
	Order: number;
	Visible: boolean;
	CharacterColor: Color3;
}) {
	let Value = useAtom(Atom);

	const Focused = useAtom(SettingsFocusAtom);
	const Hovered = useAtom(SettingsHoverAtom);
	const Selected = Focused === Key;

	const Expanded = Type === "Slider" && Selected;
	const BallSelectorRef = useRef<Frame>();
	const SliderRef = useRef<Frame>();
	const [Aspect, Motion] = useMotion(8);

	useEffect(() => {
		if (Type === "Slider" && Selected) {
			if (!SliderRef.current || !BallSelectorRef.current) return;

			const [Slider, Ball] = [SliderRef.current, BallSelectorRef.current];

			let IsDragging = false;

			const Connections = new Trash();
			Connections.add(
				UserInputService.InputBegan.Connect((Input) => {
					if (Input.UserInputType === Enum.UserInputType.MouseButton1 || Input.UserInputType === Enum.UserInputType.Touch) {
						const Pos = new Vector2(Input.Position.X, Input.Position.Y);
						const Bounds = [Ball.AbsolutePosition, Ball.AbsolutePosition.add(Ball.AbsoluteSize)];

						if (Pos.X >= Bounds[0].X && Pos.Y >= Bounds[0].Y && Pos.X <= Bounds[1].X && Pos.Y <= Bounds[1].Y) {
							IsDragging = true;
						}
					}
				}),
			);
			Connections.add(
				UserInputService.InputChanged.Connect((Input) => {
					if (IsDragging && (Input.UserInputType === Enum.UserInputType.MouseMovement || Input.UserInputType === Enum.UserInputType.Touch)) {
						const Min = GetMeta<number>("SliderMin", Key);
						const Max = GetMeta<number>("SliderMax", Key);
						const Increment = GetMeta<number>("SliderInc", Key);
						const Alpha = (Input.Position.X - Slider.AbsolutePosition.X) / Slider.AbsoluteSize.X;
						const Value = Min + Alpha * (Max - Min);
						const Steps = math.round((Value - Min) / Increment);

						SetChanged(math.clamp(Min + Steps * Increment, Min, Max));
					}
				}),
			);
			Connections.add(
				UserInputService.InputEnded.Connect((Input) => {
					if (IsDragging && (Input.UserInputType === Enum.UserInputType.MouseButton1 || Input.UserInputType === Enum.UserInputType.Touch)) {
						IsDragging = false;
					}
				}),
			);

			function Move(Direction: -1 | 1) {
				const Value = Atom() as number;
				const Min = GetMeta<number>("SliderMin", Key);
				const Max = GetMeta<number>("SliderMax", Key);
				const Increment = GetMeta<number>("SliderInc", Key);
				SetChanged(math.clamp(Value + Increment * Direction, Min, Max));
			}

			Connections.add(Nav.OnMoveLeft.Connect(() => Move(-1)));
			Connections.add(Nav.OnMoveRight.Connect(() => Move(1)));

			return () => Connections.destroy();
		}
	}, [Selected, BallSelectorRef, SliderRef]);

	useLayoutEffect(() => {
		Motion.tween(Expanded ? 4 : 8, {
			duration: 0.1,
			easing: "sineOut",
		});
	}, [Expanded]);

	useEffect(() => {
		if (Type === "Slider") {
			const Connection = Signal.Connect(() => {
				if (SettingsFocusAtom() === Key) SettingsFocusAtom(undefined);
				else SettingsFocusAtom(Key);
			});

			return () => Connection.Disconnect();
		}
	}, [Type]);

	return (
		<frame
			Visible={Visible}
			LayoutOrder={Order}
			key={Key}
			BorderSizePixel={0}
			BackgroundTransparency={1}
			Size={UDim2.fromScale(1, 1)}
			Event={{
				MouseEnter: () => SettingsHoverAtom(Key),
				MouseLeave: () => {
					if (SettingsHoverAtom() === Key) SettingsHoverAtom(undefined);
				},
			}}
		>
			<imagelabel
				key="ImageLabel"
				ImageTransparency={Hovered === Key ? 0.5 : 0}
				BorderSizePixel={0}
				BackgroundTransparency={1}
				Image={"rbxassetid://132891770382111"}
				ImageColor3={Selected ? CharacterColor : new Color3(1, 1, 1)}
				Size={UDim2.fromScale(1, 1)}
			/>
			<uiaspectratioconstraint key="UIAspectRatioConstraint" AspectRatio={Aspect} />
			<textlabel
				key="TabTitle"
				TextWrapped={true}
				BorderSizePixel={0}
				TextXAlignment={Enum.TextXAlignment.Left}
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://16658246179", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				Text={DisplayName}
				TextScaled={true}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={28}
				Size={UDim2.fromScale(0.5906, 1.0)}
				Position={new UDim2(0, 10, 0, 0)}
			>
				<uipadding key="UIPadding" PaddingBottom={new UDim(0, 5)} PaddingTop={new UDim(0, 5)} />
				<uiaspectratioconstraint key="UIAspectRatioConstraint" AspectRatio={5.288} />
			</textlabel>
			<frame key="ModeContainer" BorderSizePixel={0} Position={new UDim2(0.955, 0, 0, 0)} AnchorPoint={new Vector2(1, 0)} BackgroundTransparency={1} Size={UDim2.fromScale(0.3, 1)}>
				{Type === "Slider" ? (
					<Modes.Slider
						Key={Key}
						Expanded={Expanded}
						Value={Value as number}
						SetChanged={SetChanged}
						Min={GetMeta("SliderMin", Key)}
						Max={GetMeta("SliderMax", Key)}
						Increment={GetMeta("SliderInc", Key)}
						DisplayFunc={GetMeta("SliderFunc", Key)}
					/>
				) : Type === "Carousel" ? (
					<Modes.Carousel Signal={Signal} Value={Value as string} SetChanged={SetChanged} Options={GetMeta("CarouselOptions", Key)} Key={Key} />
				) : Type === "Toggle" ? (
					<Modes.Toggle Signal={Signal} Value={Value} SetChanged={SetChanged} />
				) : (
					<></>
				)}
			</frame>
			{Type === "Slider" && Expanded ? (
				<canvasgroup
					key="SliderPopup"
					BorderSizePixel={0}
					Position={new UDim2(0.05, 0, 1, -10)}
					AnchorPoint={new Vector2(0, 1)}
					BackgroundTransparency={1}
					Size={UDim2.fromScale(0.8, 0.4)}
				>
					<frame
						key="Slider"
						BorderSizePixel={0}
						BackgroundColor3={Color3.fromRGB(255, 255, 255)}
						Position={UDim2.fromScale(0.5, 0.5)}
						AnchorPoint={new Vector2(0.5, 0.5)}
						Size={new UDim2(0.8, 0, 0, 0)}
						ref={SliderRef}
					>
						<uistroke key="UIStroke" Color={Color3.fromRGB(255, 255, 255)} Thickness={2} Transparency={0.5} />
						<frame
							key="Ball"
							BorderSizePixel={0}
							BackgroundColor3={Color3.fromRGB(255, 255, 255)}
							Position={UDim2.fromScale((Value as number) / (GetMeta("SliderMax", Key) as number), 0.5)}
							AnchorPoint={new Vector2(0.5, 0.5)}
							Size={UDim2.fromOffset(15, 15)}
						>
							<frame
								ref={BallSelectorRef}
								key={"BallSelector"}
								AnchorPoint={new Vector2(0.5, 0.5)}
								Transparency={1}
								Position={UDim2.fromScale(0.5, 0.5)}
								Size={UDim2.fromScale(2.5, 2.5)}
							/>
							<uicorner
								key="UICorner"
								TopLeftRadius={new UDim(1, 0)}
								BottomRightRadius={new UDim(1, 0)}
								BottomLeftRadius={new UDim(1, 0)}
								TopRightRadius={new UDim(1, 0)}
								CornerRadius={new UDim(1, 0)}
							/>
							<uistroke key="UIStroke" Color={Color3.fromRGB(167, 167, 167)} Thickness={2} Transparency={0.5} />
						</frame>
					</frame>
					<textlabel
						key="Left"
						TextWrapped={true}
						BorderSizePixel={0}
						TextXAlignment={Enum.TextXAlignment.Left}
						BackgroundTransparency={1}
						Active={true}
						FontFace={new Font("rbxassetid://16658246179", Enum.FontWeight.Regular, Enum.FontStyle.Normal)}
						Text={"<"}
						TextScaled={true}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextSize={14}
						Size={UDim2.fromScale(1, 1)}
						Selectable={true}
						TextTransparency={0.5}
					/>
					<textlabel
						key="Right"
						TextWrapped={true}
						BorderSizePixel={0}
						TextXAlignment={Enum.TextXAlignment.Right}
						BackgroundTransparency={1}
						Active={true}
						FontFace={new Font("rbxassetid://16658246179", Enum.FontWeight.Regular, Enum.FontStyle.Normal)}
						Text={">"}
						TextScaled={true}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextSize={14}
						Size={UDim2.fromScale(1, 1)}
						Selectable={true}
						TextTransparency={0.5}
					/>
				</canvasgroup>
			) : undefined}

			{Type === "Slider" ? (
				<textbutton
					Transparency={1}
					Size={UDim2.fromScale(1, 1)}
					ZIndex={99}
					Event={{
						MouseButton1Click: () => Signal.Fire(),
					}}
				>
					<uiaspectratioconstraint AspectRatio={8} />
				</textbutton>
			) : undefined}
		</frame>
	);
}

const Signals: Record<string, Signal> = {};
const Atoms: Record<string, Atom<unknown>> = {};
function GetAtom(Key: string, Value: unknown) {
	let Atom = Atoms[Key];
	if (!Atom) {
		Atom = atom(Value);
		Atoms[Key] = Atom;
	}

	let EventSignal = Signals[Key];
	if (!EventSignal) {
		EventSignal = new Signal();
		Signals[Key] = EventSignal;
	}

	return $tuple(Atom, EventSignal);
}

export function SettingsUI({ CharacterColor }: { CharacterColor: Color3 }) {
	const Settings = useFlameworkDependency<SettingsController>();
	const Page = useAtom(SettingsTabAtom);
	const Platform = useAtom(PlatformContextAtom);
	const OptionsScrollRef = useRef<ScrollingFrame>();

	const Tabs = useMemo(() => {
		const Output = [];
		for (const Key of SettingsCategories) Output.push(<Tab CharacterColor={CharacterColor} TabName={Key} Order={GetTabOrder(Key)} />);

		return Output;
	}, []);

	const Options = useMemo(() => {
		const Output = [];
		let First: string | undefined;
		for (const Key of SettingsKeys) {
			const Category = GetMeta<string>("Category", Key);
			const DisplayName = GetMeta<string>("DisplayName", Key);
			const Type = GetMeta<string>("Type", Key);
			const Value = Settings.Data.Data.Settings[Key as never];
			if (Category === Page && First === undefined) First = Key;

			const [Atom, Signal] = GetAtom(Key, Value);
			Output.push(
				<Option
					Visible={Category === Page}
					SetChanged={(NewValue) => {
						// purposefully breaking the read only rule here as data will be loaded by the time you can modify settings, and this improves client feedback
						Settings.Data.Data.Settings[Key as never] = NewValue as never;
						ClientEvents.UpdateSetting(Key as keyof SettingsData, NewValue);
						Atoms[Key]?.(NewValue);
					}}
					DisplayName={DisplayName}
					Type={Type as "Toggle"}
					Key={Key}
					Atom={Atom}
					Signal={Signal}
					Order={GetMeta("Order", Key)}
					CharacterColor={CharacterColor}
				/>,
			);
		}

		if (OptionsScrollRef.current) OptionsScrollRef.current.CanvasPosition = Vector2.zero;
		SettingsHoverAtom(First);

		return Output;
	}, [Page]);

	// effects
	useMountEffect(() => {
		const Connection = Settings.Data.OnUpdate.Connect(() => {
			for (const [Key, Atom] of pairs(Atoms)) {
				const Value = Settings.Data.Data.Settings[Key as never];
				if (Atom() !== Value) Atom(Value);
			}
		});

		return () => Connection.Disconnect();
	});

	// navigation
	useLayoutEffect(() => {
		const Scroll = OptionsScrollRef.current!;
		if (!Scroll) return;

		const Connections = new Trash();

		function Navigate(Direction: number) {
			SettingsFocusAtom(undefined);

			const Option = SettingsHoverAtom();
			const AllOptions = (Scroll.GetChildren().filter((V) => V.IsA("Frame") && V.Visible && V.Name !== "PADDING") as Frame[]).sort((A, B) => A.LayoutOrder < B.LayoutOrder);
			const AllNames = AllOptions.map((Value) => Value.Name);
			const Size = AllOptions.size();

			if (Option === undefined) SettingsHoverAtom(Direction === 1 ? AllOptions[0].Name : AllOptions[Size - 2].Name);
			else {
				const Index = (AllNames.indexOf(Option) + Direction) % Size;
				SettingsHoverAtom(AllNames[Index]);
			}

			const NewOption = SettingsHoverAtom();
			if (!NewOption) return;

			const Index = AllNames.indexOf(NewOption);
			if (Index === -1) return;

			let ScrollDistance = 0;
			AllOptions.forEach((Frame, CurrentIndex) => {
				if (CurrentIndex >= Index) return;

				ScrollDistance += Frame.AbsoluteSize.Y;

				if (CurrentIndex > 0) ScrollDistance += 15; // padding
			});

			Scroll.CanvasPosition = new Vector2(0, ScrollDistance);
		}

		function NavigateTab(Direction: number) {
			const Index = GetTabOrder(SettingsTabAtom());
			const Size = SettingsCategories.size();

			const NextIndex = (Index + Direction) % Size;
			SettingsTabAtom(SettingsCategories[NextIndex]);
		}

		Connections.add(Nav.OnNavigateUp.Connect(() => Navigate(-1)));
		Connections.add(Nav.OnNavigateDown.Connect(() => Navigate(1)));
		Connections.add(Nav.OnPageLeft.Connect(() => NavigateTab(-1)));
		Connections.add(Nav.OnPageRight.Connect(() => NavigateTab(1)));
		Connections.add(
			Nav.OnNavigateSelect.Connect(() => {
				const Hover = SettingsHoverAtom();
				if (!Hover) return;

				Signals[Hover]?.Fire();
			}),
		);
		Connections.add(
			Nav.OnNavigateBack.Connect(() => {
				if (SettingsFocusAtom()) SettingsFocusAtom(undefined);
				else WindowAtom("Pause");
			}),
		);

		return () => Connections.destroy();
	}, [OptionsScrollRef]);

	return (
		<frame key="Settings" BorderSizePixel={0} BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}>
			<imagelabel
				key="LeftPanel"
				ZIndex={-2}
				BorderSizePixel={0}
				SliceCenter={new Rect(0, 7, 0, 627)}
				BackgroundTransparency={1}
				Image={"rbxassetid://94202000351962"}
				Size={UDim2.fromScale(1, 1)}
			>
				<imagelabel key={"Glow"} BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)} ZIndex={-99} Image={"rbxassetid://72569468285945"} ImageColor3={CharacterColor} />
			</imagelabel>
			{/* TODO: settings explanation panel on right side */}
			{/*
			<imagelabel
				key="RightPanel"
				ZIndex={-2}
				BorderSizePixel={0}
				SliceCenter={new Rect(786, 7, 786, 626)}
				Position={new UDim2(1, 0, 0, 0)}
				BackgroundTransparency={1}
				AnchorPoint={new Vector2(1, 0)}
				Image={"rbxassetid://137038457102786"}
				Size={UDim2.fromScale(1, 1)}
			>
				<imagelabel key={"Glow"} BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)} ZIndex={-99} Image={"rbxassetid://71396032908525"} ImageColor3={CharacterColor} />
				<imagelabel key="ImageLabel" BorderSizePixel={0} BackgroundTransparency={1} Image={"rbxassetid://84496752523130"} Size={UDim2.fromScale(1, 1)} />
			</imagelabel>
			*/}
			<frame key="LeftPanelContent" BorderSizePixel={0} BackgroundTransparency={1} Size={UDim2.fromScale(0.4, 1)}>
				<scrollingframe
					key="Tabs"
					ScrollingEnabled={Platform !== "Gamepad"}
					ScrollingDirection={Enum.ScrollingDirection.X}
					BorderSizePixel={0}
					CanvasSize={new UDim2()}
					BackgroundTransparency={1}
					Active={true}
					ScrollBarThickness={0}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Size={new UDim2(0.9, 0, 0, 60)}
					AutomaticCanvasSize={Enum.AutomaticSize.X}
					Position={UDim2.fromScale(0.5, 0.085)}
				>
					<uilistlayout key="UIListLayout" FillDirection={Enum.FillDirection.Horizontal} SortOrder={Enum.SortOrder.LayoutOrder} />
					{Tabs}
				</scrollingframe>
				<canvasgroup
					key="OptionsCanvas"
					BorderSizePixel={0}
					Position={UDim2.fromScale(0.435, 0.5131)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Active={true}
					Selectable={true}
					Size={UDim2.fromScale(0.8201, 0.7)}
					SelectionGroup={true}
				>
					<scrollingframe
						ref={OptionsScrollRef}
						key="Options"
						ScrollingEnabled={Platform !== "Gamepad"}
						BorderSizePixel={0}
						BackgroundTransparency={1}
						Active={true}
						ScrollBarThickness={6}
						VerticalScrollBarPosition={Enum.VerticalScrollBarPosition.Left}
						Selectable={false}
						AnchorPoint={new Vector2(0.5, 0.5)}
						Size={UDim2.fromScale(1, 1)}
						Position={UDim2.fromScale(0.5, 0.5)}
						AutomaticCanvasSize={"Y"}
					>
						{Options}
						<uilistlayout key="UIListLayout" SortOrder={Enum.SortOrder.LayoutOrder} Padding={new UDim(0, 15)} />
						<uipadding key="UIPadding" PaddingRight={new UDim(0, 15)} PaddingLeft={new UDim(0, 15)} />
						<frame key={"PADDING"} LayoutOrder={999} Size={UDim2.fromScale(1, 1)} Transparency={1} />
					</scrollingframe>
					<uigradient
						key="UIGradient"
						Rotation={90}
						Transparency={
							new NumberSequence([
								new NumberSequenceKeypoint(0, 0, 0),
								new NumberSequenceKeypoint(0.2738, 0, 0),
								new NumberSequenceKeypoint(0.5513, 0.075, 0),
								new NumberSequenceKeypoint(0.7267, 0.6187, 0),
								new NumberSequenceKeypoint(0.8853, 0.9312, 0),
								new NumberSequenceKeypoint(1, 1, 0),
							])
						}
					/>
				</canvasgroup>
			</frame>
		</frame>
	);
}
