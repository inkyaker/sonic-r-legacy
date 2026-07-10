import { Dependency } from "@flamework/core";
import type { Atom } from "@rbxts/charm";
// biome-ignore lint/correctness/noUnusedImports: <React>
import React, { useEffect, useLayoutEffect, useRef } from "@rbxts/react";
import { ReplicatedStorage } from "@rbxts/services";
import { Trash } from "@rbxts/trash";
import { ClientEvents } from "framework/client_networking";
import { Nav } from "framework/control/input";
import type { SoundController } from "framework/draw/sound";
import type { RS } from "shared/common/types";

const Replicated = ReplicatedStorage as RS;
const Pivot = CFrame.Angles(math.rad(-15), math.pi, 0).add(new Vector3(0, -0.5, -4));

export function CharacterSelect({ WindowAtom, CharacterColor }: { WindowAtom: Atom<"Settings" | "Pause" | "Controls" | "Characters" | undefined>; CharacterColor: Color3 }) {
	const [SonicViewportRef, ShadowViewportRef] = [useRef<ViewportFrame>(), useRef<ViewportFrame>()];
	useLayoutEffect(() => {
		const Sonic = Replicated.Assets.Characters.Sonic.Clone();
		const Shadow = Replicated.Assets.Characters.Shadow.Clone();
		Sonic.PivotTo(Pivot);
		Shadow.PivotTo(Pivot);

		Sonic.Parent = SonicViewportRef.current;
		Shadow.Parent = ShadowViewportRef.current;

		return () => {
			Sonic.Destroy();
			Shadow.Destroy();
		};
	}, [SonicViewportRef, ShadowViewportRef]);

	useEffect(() => {
		const Connections = new Trash();

		Connections.add(Nav.OnPageLeft.Connect(() => ClientEvents.ChangeCharacter("Sonic")));
		Connections.add(Nav.OnPageRight.Connect(() => ClientEvents.ChangeCharacter("Shadow")));
		Connections.add(Nav.OnNavigateBack.Connect(() => WindowAtom("Pause")));

		return () => {
			Connections.destroy();
			Dependency<SoundController>().Play("UI/WindowClose");
		};
	});

	return (
		<imagelabel
			key="CharacterSelect"
			BorderSizePixel={0}
			Position={UDim2.fromScale(0.5, 0.5)}
			BackgroundTransparency={1}
			AnchorPoint={new Vector2(0.5, 0.5)}
			Image={"rbxassetid://77478035203403"}
			Size={UDim2.fromScale(0.6, 0.6)}
		>
			<imagelabel key="Glow" BorderSizePixel={0} BackgroundTransparency={1} Image={"rbxassetid://98959793563762"} Size={UDim2.fromScale(1, 1)} ImageColor3={CharacterColor} />
			<uiaspectratioconstraint key="UIAspectRatioConstraint" AspectRatio={1.5236} />
			<viewportframe
				key="Sonic"
				BorderSizePixel={0}
				BackgroundColor3={new Color3(0, 0, 0)}
				Ambient={Color3.fromRGB(255, 255, 255)}
				Position={new UDim2(0.5, 0, 0, 0)}
				BackgroundTransparency={1}
				LightDirection={new Vector3(-0.34, -0.35, -1)}
				AnchorPoint={new Vector2(1, 0)}
				LightColor={Color3.fromRGB(20, 122, 255)}
				Size={UDim2.fromScale(0.425, 1)}
				ref={SonicViewportRef}
			>
				<textbutton
					key="Button"
					BorderSizePixel={0}
					TextTransparency={1}
					Size={UDim2.fromScale(1, 1)}
					FontFace={new Font("rbxasset://fonts/families/SourceSansPro.json", Enum.FontWeight.Regular, Enum.FontStyle.Normal)}
					BackgroundTransparency={1}
					TextColor3={Color3.fromRGB(0, 0, 0)}
					Text={""}
					TextSize={14}
					Event={{
						MouseButton1Click: () => ClientEvents.ChangeCharacter("Sonic"),
					}}
				/>
			</viewportframe>
			<viewportframe
				key="Shadow"
				BorderSizePixel={0}
				BackgroundColor3={new Color3(0, 0, 0)}
				Ambient={Color3.fromRGB(255, 255, 255)}
				Position={new UDim2(0.5, 0, 0, 0)}
				BackgroundTransparency={1}
				LightDirection={new Vector3(-0.34, -0.35, -1)}
				LightColor={Color3.fromRGB(140, 48, 11)}
				Size={UDim2.fromScale(0.425, 1)}
				ref={ShadowViewportRef}
			>
				<textbutton
					key="Button"
					BorderSizePixel={0}
					TextTransparency={1}
					Size={UDim2.fromScale(1, 1)}
					FontFace={new Font("rbxasset://fonts/families/SourceSansPro.json", Enum.FontWeight.Regular, Enum.FontStyle.Normal)}
					BackgroundTransparency={1}
					TextColor3={Color3.fromRGB(0, 0, 0)}
					Text={""}
					TextSize={14}
					Event={{
						MouseButton1Click: () => ClientEvents.ChangeCharacter("Shadow"),
					}}
				/>
			</viewportframe>
			<textbutton
				key="Return"
				TextWrapped={true}
				BorderSizePixel={0}
				BackgroundColor3={Color3.fromRGB(23, 23, 23)}
				Size={UDim2.fromScale(0.4, 0.1)}
				Position={new UDim2(0.5, 0, 1, 30)}
				TextScaled={true}
				FontFace={new Font("rbxassetid://16658246179", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
				AnchorPoint={new Vector2(0.5, 0)}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				Text={"RETURN"}
				TextSize={14}
				Event={{
					MouseButton1Click: () => WindowAtom("Pause"),
				}}
			>
				<uicorner
					key="UICorner"
					TopLeftRadius={new UDim(0.125, 0)}
					BottomRightRadius={new UDim(0.125, 0)}
					BottomLeftRadius={new UDim(0.125, 0)}
					TopRightRadius={new UDim(0.125, 0)}
					CornerRadius={new UDim(0.125, 0)}
				/>
				<uistroke key="UIStroke" Color={Color3.fromRGB(15, 15, 15)} Thickness={3} ApplyStrokeMode={Enum.ApplyStrokeMode.Border} />
				<uistroke key="UIStroke1" Color={CharacterColor} ApplyStrokeMode={Enum.ApplyStrokeMode.Border} />
				<uipadding key="UIPadding" PaddingBottom={new UDim(0.1, 0)} PaddingTop={new UDim(0.1, 0)} />
			</textbutton>
		</imagelabel>
	);
}
