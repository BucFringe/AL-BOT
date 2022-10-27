import logger from "../logger.js";
import AL, { Character, Mage, MonsterName} from "alclient";
import { singleAttack } from "../attack/singleAttack.js";
import { healthRegen, manaRegen } from "../utils/regen.js";
import { sendMoney, sendPackage } from "../attack/looting.js";
import {updateStats} from "../logger/prom.js";
import {getconfig} from "../utils/db.js";
import {respawn} from "../utils/rip.js";


const monster: MonsterName = "goo" 
const itemsKeep = ["hpot0","mpot0"]

export async function mageLogin(name: string){
    logger.info(`Starting bot ${name}`);
    let bot = await AL.Game.startMage(name, "US", "I");
    logger.info(`${bot.name} logged in`)
    await runMageLoops(bot);
}

async function runMageLoops(bot: Mage){
    let config = await getconfig(bot.name);
    if (!config) return;

    setInterval(async () => {
        await respawn(bot);
    }, 1000);

    setInterval(async () => {
        try{
            await bot.acceptPartyInvite('stevenly')
        } catch (e) {

        }
    },500);

    setInterval(async () => {
        await manaRegen(bot);
        await healthRegen(bot);
    },600);

    setInterval(async () => {
        await singleAttack(bot, monster);
    }, 300);

    setInterval(async () => {
        await sendMoney(bot);
        await sendPackage(bot, itemsKeep);
    }, 2000);

    setInterval(async () => {
        await updateStats(bot);
    }, 2000);
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
        try{
            await bot.acceptPartyInvite("stevenly")
        } catch (e){

        }
        await healthRegen(bot);
        await manaRegen(bot);
        await singleAttack(bot, monster);
        await sendMoney(bot);
        await sendPackage(bot, itemsKeep);
        await updateStats(bot);
    }

    setTimeout(async () => {
        await runMage(bot), 1000
    })
}

