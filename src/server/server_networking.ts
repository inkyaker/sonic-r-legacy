import { Controller, type OnStart, type OnTick } from "@flamework/core";
import type { Networking } from "@flamework/networking";
import { Players } from "@rbxts/services";
import { Events, Functions } from "shared/common/networking";

const Rates: Record<string, Record<number, { Count: number; LastTick: number } | undefined> | undefined> = {};

@Controller()
class _RatelimitController implements OnStart, OnTick {
	public onStart() {
		Players.PlayerRemoving.Connect((Player) => {
			for (const [_, EventData] of pairs(Rates)) delete EventData[Player.UserId];
		});
	}
	public onTick() {
		for (const [_, EventData] of pairs(Rates)) {
			for (const [_Player, Data] of pairs(EventData)) {
				if (os.clock() - Data.LastTick >= os.clock()) {
					Data.Count = 0;
					Data.LastTick = math.huge; // automatically reset on next trigger
				}
			}
		}
	}
}

function Ratelimit<I extends Array<unknown>>(LimitPerSecond: number): Networking.EventMiddleware<I> {
	return (Next, _Event) => {
		const EventRates: Record<number, { Count: number; LastTick: number } | undefined> = {};
		Rates[_Event.globalName] = EventRates;

		function SpawnFor(Player: Player) {
			const Data = EventRates[Player.UserId]!;
			const Clock = os.clock();
			Data.Count++;
			Data.LastTick = Clock;
		}
		return (Player, ...Args) => {
			if (Player) {
				let Data = EventRates[Player.UserId];
				if (!Data) {
					Data = { Count: 0, LastTick: 0 };
					EventRates[Player.UserId] = Data;
				}

				if (Data.Count >= LimitPerSecond) return;

				SpawnFor(Player);
				Next(Player, ...Args);
			} else Next(Player, ...Args);
		};
	};
}

export const ServerEvents = Events.createServer({
	middleware: {
		SpawnEffect: [Ratelimit(5)],
	},
});
export const ServerFunctions = Functions.createServer({});
