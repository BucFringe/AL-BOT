import {Character} from "alclient";
import logger from "../logger.js";


export async function respawn(bot: Character){
    if (bot.rip){
        try{
            await bot.respawn();
        } catch (e) {
            logger.warn(e)
        }
    }
}