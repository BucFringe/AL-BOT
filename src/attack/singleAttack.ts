import { Character, MonsterName } from "alclient";
import logger from "../logger.js";
import { looting } from "./looting.js";


export async function singleAttack(bot: Character, monster: MonsterName){
    // Where each bot will attack a different target.
    const target = bot.getEntity({ canWalkTo: true, type: monster, withinRange: "attack"})
    if (target){
        if (!bot.isOnCooldown("attack")){
            try{
                await bot.basicAttack(target.id);
            } catch (e) {
                logger.warn(e);
            }
        }
    } else {
        try{
            if (!bot.smartMoving){
                await bot.smartMove(monster);
            }
        } catch (e){
            logger.warn(e);
        }
    }
    await looting(bot);
}