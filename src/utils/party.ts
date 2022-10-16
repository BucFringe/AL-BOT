import {Character} from "alclient";
import logger from "../logger.js";


export async function partyLeader(bot: Character, party: any){
    try{
        for (let p in party){
            if (!bot.partyData) {
                await bot.sendPartyInvite(party[p])
                logger.info(`${party[p]} has been sent an invite`)
            } else if (!bot.partyData.list.includes(party[p])){
                if (party[p] === bot.name) continue;
                await bot.sendPartyInvite(party[p])
                logger.info(`${party[p]} has been sent an invite`)
            }
        }
    } catch (e){
        logger.error(e)
    }
}