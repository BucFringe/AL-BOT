import {Character} from "alclient";
import {Registry, Counter} from "prom-client";


export async function goldTracker(bot: Character, register: Registry, startingGold: number){
    const gold = new Counter({
        name: "character_gold",
        help: "The amount of gold we have got this script run"
    })

    let currentGold = bot.gold
    let goldSinceStart = Math.max(currentGold - startingGold, 0)
    gold.inc(goldSinceStart)
}