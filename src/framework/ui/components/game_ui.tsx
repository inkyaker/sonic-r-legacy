import type { Atom } from "@rbxts/charm";
/** biome-ignore lint/correctness/noUnusedImports: <react> */
import React from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { usePx } from "../usepx";

export function GameUI({ RingsAtom, ScoreAtom, LivesAtom }: { RingsAtom: Atom<number>; ScoreAtom: Atom<number>; LivesAtom: Atom<number> }) {
    const PX = usePx()
    const [Rings, Score, Lives] = [
        useAtom(RingsAtom),
        useAtom(ScoreAtom),
        useAtom(LivesAtom)
    ]

    return <frame Transparency={1} Size={UDim2.fromScale(1,1)}>
        <uilistlayout/>
        <textlabel BackgroundTransparency={1} Size={PX.toUDim2(100, 30)} Text={`${Rings}`}></textlabel>
        <textlabel BackgroundTransparency={1} Size={PX.toUDim2(100, 30)} Text={`${Score}`}></textlabel>
        <textlabel BackgroundTransparency={1} Size={PX.toUDim2(100, 30)} Text={`${Lives}`}></textlabel>
    </frame>;
}
