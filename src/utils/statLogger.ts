import {Character} from "alclient";
import * as fs from "fs";


export async function updateLogStats(bot: Character) {
    let trash = {
        "name": bot.name,
        "level": bot.level,
        "xp": bot.xp,
        "mana": bot.mp,
        "max_mana": bot.max_mp,
        "health": bot.hp,
        "items": bot.items,
    }

}