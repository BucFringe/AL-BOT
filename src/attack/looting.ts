import { Character, Tools } from "alclient";
import logger from "../logger.js";

export async function looting(bot: Character){
    try{
        for(const [id, chest] of bot.chests) {
            if (Tools.distance(bot, chest) > 800) continue; //Chest is too far away to loot
            await bot.openChest(id);
        }
    } catch(e){
        logger.error(e);
    }
}

export async function sendMoney(bot: Character){
    try{
        if (bot.gold > 5000 && bot.ready){
            logger.info(`${bot.name} has ${bot.gold} gold`)
            await bot.sendGold("stevenly", bot.gold);
        }
    } catch(e){
        logger.warn(e);
    }
}

export async function sendPackage(bot: Character, keepItems: any){
    try{
        if (!bot.ready) return;
        for (let item of bot.items) {
            if (!item) continue;
            if (!keepItems.includes(item.name)){
                let itemSlot = bot.locateItem(item.name);
                logger.info(`${bot.name} has sent ${item.name}`)
                await bot.sendItem("stevenly", itemSlot);
            }
        }
    } catch (e){
        logger.warn(e);
    }
}
