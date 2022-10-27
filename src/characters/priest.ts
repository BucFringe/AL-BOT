import AL, {ItemName, MonsterName, Priest, ServerIdentifier, ServerRegion} from "alclient";
import logger from "../logger.js";
import {getconfig} from "../utils/db.js";
import {respawn} from "../utils/rip.js";
import {singleAttack} from "../attack/singleAttack.js";
import {healthRegen, manaRegen} from "../utils/regen.js";
import {sendMoney, sendPackage} from "../attack/looting.js";
import {Item} from "alclient/build/Item";
import {updateStats} from "../logger/prom.js";


const monster: MonsterName = "goo";
const itemsKeep: ItemName[] = ["hpot0","mpot0", "tracker"];

export async function priestLogin(name: string, region: ServerRegion, number: ServerIdentifier){
    logger.info(`Starting bot ${name}`);
    let bot = await AL.Game.startPriest(name,region,number);
    logger.info(`${bot.name} logged in`)
    await runPriestLoop(bot);
}

async function runPriestLoop(bot: Priest){
    let config = await getconfig(bot.name);
    if (!config) return;

    // setInterval(async () => {
    //     let conf = await getconfig(bot.name)
    //     // @ts-ignore
    //     let mon = conf.monster
    //     console.log(mon)
    // }, 2000)

    setInterval(async () => {
        await respawn(bot);
    }, 1000)

    setInterval(async () => {
        try{
            await bot.acceptPartyInvite('stevenly')
        } catch (e) {

        }
    },500);

    setInterval(async () => {
        await singleAttack(bot, monster);
    }, 250)

    setInterval(async () => {
        await manaRegen(bot);
        await healthRegen(bot);
    }, 600);

    setInterval(async () => {
        await sendMoney(bot);
        await sendPackage(bot, itemsKeep);
    },2000)

    setInterval(async () => {
        await updateStats(bot);
    }, 2000)
}
