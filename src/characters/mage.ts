import logger from "../logger.js";
import AL, { Character, Mage, MonsterName} from "alclient";
import { singleAttack } from "../attack/singleAttack.js";
import { healthRegen, manaRegen } from "../utils/regen.js";
import { sendMoney, sendPackage } from "../attack/looting.js";

const monster: MonsterName = "goo" 
const itemsKeep = ["hpot0","mpot0"]

export async function mageLogin(name: string){
    logger.info(`Starting bot ${name}`);
    let bot = await AL.Game.startMage(name, "EU", "II");
    logger.info(`${bot.name} logged in`)
    await runMage(bot)
}

async function runMage(bot: Mage){
    if (!bot) return
    if (bot.rip){
        logger.info(`${bot.name} is dead`);
        try{
            await bot.respawn();
        } catch (e){
            logger.error(e);
        }
    }
    if (bot.ready){
        // The bot is now ready to do shit
        await healthRegen(bot);
        await manaRegen(bot);
        await singleAttack(bot, monster);
        await sendMoney(bot);
        await sendPackage(bot, itemsKeep);
    }

    setTimeout(async () => {
        await runMage(bot), 1000
    })
}

