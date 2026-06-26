import type { Atom } from "@rbxts/charm";
import { useMotion } from "@rbxts/pretty-react-hooks";
/** biome-ignore lint/correctness/noUnusedImports: <react> */
import React, { useEffect, useMemo, useState } from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { RunService } from "@rbxts/services";
import { Environment } from "@rbxts/ui-labs";
import { Constants } from "shared/common/constants";
import type { CharacterType } from "shared/common/data";
import { BallTrailColors } from "shared/common/globals";
import type { InputPopup as PopupData } from "../ui_controller";

const Red = Color3.fromRGB(173, 0, 0);
const Yellow = Color3.fromRGB(255, 214, 52);
const White = Color3.fromRGB(255, 255, 255);

function RingCounter({ Rings, Score, Mult, CharacterColor }: { Rings: number; Score: number; Mult: number; CharacterColor: Color3 }) {
	const [RingColor, Motion] = useMotion(Color3.fromRGB(255, 214, 52));
	const [RingState, SetRingState] = useState(0);

	useEffect(() => {
		const NewRingState = Rings <= 0 ? 1 : Rings >= Constants.SuperRingRequirement ? 2 : 3;
		if (NewRingState !== RingState) SetRingState(NewRingState);
	}, [Rings]);

	useEffect(() => {
		if (RingState < 3) {
			let Time = 0;
			const [Color1, Color2, StartColor, TimeMult] = [RingState === 1 ? Red : Yellow, RingState === 1 ? Yellow : White, RingColor.getValue(), RingState === 1 ? 6 : 1];
			const Connection = RunService.RenderStepped.Connect((Delta) => {
				Time += Delta * TimeMult;
				const LoopAlpha = (math.sin(Time) + 1) / 2;
				const CurrentLoopColor = Color1.Lerp(Color2, LoopAlpha);
				const BlendAlpha = math.clamp(Time / (0.2 * TimeMult), 0, 1);

				Motion.setPosition(StartColor.Lerp(CurrentLoopColor, BlendAlpha));
			});
			return () => Connection.Disconnect();
		}

		Motion.tween(Yellow, { duration: 0.2 });
	}, [RingState]);

	return (
		<frame key="RingCounter" BorderSizePixel={0} Position={new UDim2(0, 15, 1, -15)} AnchorPoint={new Vector2(0, 1)} BackgroundTransparency={1} Size={UDim2.fromScale(0.3, 0.3)}>
			<imagelabel
				key="Rings"
				ZIndex={4}
				BorderSizePixel={0}
				Position={UDim2.fromScale(0.5, 0.5)}
				BackgroundTransparency={1}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Image={"rbxassetid://99517661910037"}
				Size={UDim2.fromScale(1, 1)}
			>
				<imagelabel
					key="RingsGlow"
					ImageColor3={CharacterColor}
					BorderSizePixel={0}
					Position={UDim2.fromScale(0.5, 0.5)}
					BackgroundTransparency={1}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Image={"rbxassetid://136337076280105"}
					Size={UDim2.fromScale(1, 1)}
				/>
				<imagelabel
					key="RingIcon"
					ZIndex={5}
					BorderSizePixel={0}
					BackgroundTransparency={1}
					ImageColor3={RingColor}
					Image={"rbxassetid://115285097247213"}
					Size={UDim2.fromScale(1, 1)}
				/>
			</imagelabel>
			<imagelabel
				key="ScoreText"
				ZIndex={5}
				BorderSizePixel={0}
				Position={UDim2.fromScale(0.5, 0.5)}
				BackgroundTransparency={1}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Image={"rbxassetid://106898125582526"}
				Size={UDim2.fromScale(1, 1)}
			/>
			<imagelabel
				key="BG"
				ZIndex={3}
				BorderSizePixel={0}
				Position={UDim2.fromScale(0.5, 0.5)}
				BackgroundTransparency={1}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Image={"rbxassetid://86907875892992"}
				Size={UDim2.fromScale(1, 1)}
			>
				<imagelabel
					key="BGGlow"
					ImageColor3={CharacterColor}
					BorderSizePixel={0}
					Position={UDim2.fromScale(0.5, 0.5)}
					BackgroundTransparency={1}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Image={"rbxassetid://102674818173855"}
					Size={UDim2.fromScale(1, 1)}
				/>
			</imagelabel>
			<imagelabel
				key="Score"
				BorderSizePixel={0}
				Position={UDim2.fromScale(0.5, 0.5)}
				BackgroundTransparency={1}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Image={"rbxassetid://86666241270563"}
				Size={UDim2.fromScale(1, 1)}
			>
				<imagelabel
					key="ScoreGlow"
					ImageColor3={CharacterColor}
					BorderSizePixel={0}
					Position={UDim2.fromScale(0.5, 0.5)}
					BackgroundTransparency={1}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Image={"rbxassetid://117483913056756"}
					Size={UDim2.fromScale(1, 1)}
				/>
			</imagelabel>
			<textlabel
				key="RingCount"
				TextWrapped={true}
				ZIndex={10}
				BorderSizePixel={0}
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://16658246179", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				Text={`${string.rep("0", 3 - tostring(Rings).size())}${Rings}`}
				TextScaled={true}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				TextSize={14}
				Size={UDim2.fromScale(0.311, 0.3684)}
				Position={UDim2.fromScale(0.4373, 0.3558)}
			>
				<uigradient
					key="UIGradient"
					Rotation={90}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
							new ColorSequenceKeypoint(0.2664, Color3.fromRGB(255, 255, 255)),
							new ColorSequenceKeypoint(0.6834, Color3.fromRGB(184, 184, 184)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(0, 0, 0)),
						])
					}
				/>
				<uistroke key="UIStroke" LineJoinMode={Enum.LineJoinMode.Miter} Color={Color3.fromRGB(22, 22, 22)} Thickness={2} />
			</textlabel>
			<uiscale key="UIScale" Scale={0.85} />
			<textlabel
				key="ScoreCount"
				TextWrapped={true}
				ZIndex={10}
				BorderSizePixel={0}
				TextXAlignment={Enum.TextXAlignment.Right}
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://16658246179", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				Text={`${string.rep("0", 7 - tostring(Score).size())}${Score}`}
				TextScaled={true}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				TextSize={14}
				Size={UDim2.fromScale(0.6891, 0.3684)}
				Position={UDim2.fromScale(0.57, 0.7748)}
			>
				<uigradient
					key="UIGradient"
					Rotation={90}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
							new ColorSequenceKeypoint(0.2664, Color3.fromRGB(255, 255, 255)),
							new ColorSequenceKeypoint(0.6834, Color3.fromRGB(184, 184, 184)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(0, 0, 0)),
						])
					}
				/>
				<uistroke key="UIStroke" LineJoinMode={Enum.LineJoinMode.Miter} Color={Color3.fromRGB(22, 22, 22)} Thickness={2} />
			</textlabel>
			<textlabel
				key="ScoreMult"
				TextWrapped={true}
				ZIndex={10}
				BorderSizePixel={0}
				TextXAlignment={Enum.TextXAlignment.Left}
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://16658246179", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				Text={`x${Mult}`}
				TextScaled={true}
				TextColor3={Color3.fromRGB(163, 163, 163)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				TextSize={14}
				Size={UDim2.fromScale(0.6891, 0.3)}
				Position={UDim2.fromScale(0.55, 0.7748)}
			>
				<uistroke key="UIStroke" LineJoinMode={Enum.LineJoinMode.Miter} Color={Color3.fromRGB(22, 22, 22)} Thickness={2} />
				<uigradient
					key="UIGradient"
					Rotation={100}
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
							new ColorSequenceKeypoint(0.827, Color3.fromRGB(173, 173, 173)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(130, 130, 130)),
						])
					}
				/>
			</textlabel>
			<uiaspectratioconstraint key="UIAspectRatioConstraint" AspectRatio={2.6301} />
		</frame>
	);
}

function InputPopup({
	Data: Icon,
	Duration,
	OnFinished,
}: {
	Data: {
		Text: string;
		Image: string;
	};
	Duration: number;
	OnFinished: () => void;
}) {
	const [Size, Motion] = useMotion(UDim2.fromScale(0, 0));
	const [TextSize, TextMotion] = useMotion(0);

	const [Visible, SetVisible] = useState(true);

	useEffect(() => SetVisible(true), [Icon]);

	useEffect(() => {
		if (!Visible) {
			Motion.tween(UDim2.fromScale(0, 0), {
				duration: 0.1,
			});
			TextMotion.tween(0, {
				duration: 0.1,
			});

			const Thread = task.delay(0.25, () => OnFinished());
			return () => task.cancel(Thread);
		} else {
			Motion.setPosition(UDim2.fromScale(0, 0));
            TextMotion.setPosition(0);
			
			Motion.tween(UDim2.fromScale(0.1, 0.1), {
				easing: "backOut",
				duration: 0.25,
			});

			TextMotion.tween(100, {
				duration: 0.1,
			});

			if (Environment.IsStory()) return;

			let Progress = 0;
			const Connection = RunService.RenderStepped.Connect((DeltaTime) => {
				Progress += DeltaTime;

				if (Progress >= Duration) SetVisible(false);
			});
			return () => Connection.Disconnect();
		}
	}, [Visible, Icon]);

	return (
		<frame Position={UDim2.fromScale(0.5, 0.95)} Transparency={1} AnchorPoint={new Vector2(0.5, 1)} Size={Size}>
			<uilistlayout Padding={new UDim(0, 15)} HorizontalAlignment={"Center"} VerticalAlignment={"Center"} FillDirection={"Horizontal"} SortOrder={"LayoutOrder"} />
			<imagelabel key="ImageLabel" BorderSizePixel={0} BackgroundTransparency={1} Image={Icon.Image} Size={UDim2.fromScale(1, 1)} ScaleType={"Fit"} LayoutOrder={-99}>
				<uiaspectratioconstraint />
			</imagelabel>
			<textlabel
				key="TextLabel"
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://12187607287", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				Text={Icon.Text}
				TextColor3={Color3.fromRGB(0, 0, 0)}
				TextSize={TextSize}
				AutomaticSize={"X"}
				Size={UDim2.fromScale(0, 1)}
				TextTransparency={0.3}
				TextXAlignment={"Left"}
			>
				<uistroke key="UIStroke" Thickness={2} Color={Color3.fromRGB(255, 255, 255)} />
			</textlabel>
		</frame>
	);
}

export function GameUI({
	RingsAtom,
	ScoreAtom,
	MultAtom,
	CharacterTypeAtom,
	PopupAtom,
}: {
	RingsAtom: Atom<number>;
	ScoreAtom: Atom<number>;
	LivesAtom: Atom<number>;
	MultAtom: Atom<number>;
	CharacterTypeAtom: Atom<CharacterType>;
	PopupAtom: Atom<PopupData | undefined>;
}) {
	const [Rings, Score, Mult, CharacterType] = [useAtom(RingsAtom), useAtom(ScoreAtom), useAtom(MultAtom), useAtom(CharacterTypeAtom)];
	const CharacterColor = useMemo(() => BallTrailColors[CharacterType], [CharacterType]);
	const ActivePopup = useAtom(PopupAtom);

	return (
		<frame Transparency={1} Size={UDim2.fromScale(1, 1)}>
			<RingCounter Rings={Rings} Score={Score} Mult={Mult} CharacterColor={CharacterColor} />

			{ActivePopup ? <InputPopup Duration={ActivePopup.Duration} Data={ActivePopup.Data} OnFinished={() => PopupAtom(undefined)} /> : undefined}

			<textlabel
				key="TextLabel"
				AutomaticSize={Enum.AutomaticSize.XY}
				BorderSizePixel={0}
				TextXAlignment={Enum.TextXAlignment.Right}
				BackgroundTransparency={1}
				FontFace={new Font("rbxassetid://12187362578", Enum.FontWeight.ExtraBold, Enum.FontStyle.Normal)}
				Text={`SONIC:R
VERSION ${Constants.GameVersion}
HASH ${Constants.GitStamp}`}
				TextColor3={Color3.fromRGB(191, 191, 191)}
				AnchorPoint={new Vector2(1, 1)}
				TextSize={14}
				Size={UDim2.fromOffset(50, 50)}
				TextTransparency={0.5}
				Position={UDim2.fromScale(1, 1)}
			>
				<uistroke key="UIStroke" Transparency={0.85} />
				<uipadding key="UIPadding" PaddingRight={new UDim(0, 10)} PaddingBottom={new UDim(0, 10)} />
			</textlabel>
		</frame>
	);
}
