import { Character } from "alclient";
import logger from "../logger.js";

export async function healthRegen(bot: Character){
    try{
        if (!bot.rip && bot.ready){
            const hpot0 = bot.locateItem("hpot0");
            if (bot.hp < (bot.max_hp - 200)){
                // The bot needs to do some healing
                if (!bot.isOnCooldown("regen_hp")){
                    await bot.regenHP();
                    logger.info(`${bot.name} has used HP Regen.`)
                } else if (!bot.isOnCooldown("use_hp")){
                    await bot.useHPPot(bot.locateItem("hpot0"))
                    logger.info(`${bot.name} has taken a HP potion. has ${bot.countItem("hpot0")}`)
                }
            }
        }
    } catch(e){
        logger.error(e)
    }
}

export async function manaRegen(bot: Character){
    try{
        if (!bot.rip){
            const mpot0 = bot.locateItem("mpot0");
            if ((bot.mp < (bot.max_mp - 200)) && mpot0){
                // The bot needs to get more mana
                if (!bot.isOnCooldown("regen_mp")){
                    await bot.regenMP();
                    logger.info(`${bot.name} has used MP Regen.`)
                } else if (!bot.isOnCooldown("use_mp")){
                    await bot.useMPPot(bot.locateItem("mpot0"))
                    logger.info(`${bot.name} has taken a MP potion. has ${bot.countItem("mpot0")}`)
                }
            }
        }
    } catch(e){
        logger.error(e)
    }
}