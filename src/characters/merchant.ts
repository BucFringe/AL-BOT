import AL, {Character, ItemData, ItemName, Merchant, MonsterName} from "alclient";
import logger from "../logger.js"
import { healthRegen, manaRegen } from "../utils/regen.js";
import {partyLeader} from "../utils/party.js";
import {goldTracker} from "../logger/gold.js";
import {updateItemStats, updateStats} from "../logger/prom.js";
import {PrismaClient} from "@prisma/client";
import {getTask, setTask} from "../utils/db.js";

const keepItems = ["slimestaff","gslime","beewings","hpamulet","scroll0","seashell","ringsj","gem0","stand0","candy1"]
const bank2Items = ["gslime","beewings","seashell","gem0"]
const partyMembers = ["ephara","manarocks", "lotsofheals"]
const prisma = new PrismaClient()

async function runMerchantLoops(bot: Merchant){
    await prisma.$connect();
    const config = await prisma.charconfig.findFirst({
        where: {
            name : bot.name
        }
    })
    if (!config) return;

    setInterval(async () => {
        if (bot.smartMoving) await bot.closeMerchantStand();
    }, 300)

    setInterval(async () => {
        await partyLeader(bot, partyMembers)
    },10000);

    setInterval(async () => {
        await upgradeItems(bot, 'slimestaff')
    }, 4000);

    setInterval(async () => {
        await manaRegen(bot);
    }, 1000);

    setInterval( async () => {
        await farm(bot, 'goo');
    }, 500);

    setInterval(async () => {
        await updateItemStats(bot)
    }, 10000);

    setInterval(async () => {
        await giveLuck(bot)
    }, 400);

    setInterval(async () => {
        await updateStats(bot)
    }, 1000)
}
 async function farm(bot: Merchant, monster: MonsterName){
     let config = await getTask(bot.name);
     if (!config) return;
     if (config === 'farm') {
         // We should go back to the farm so we can get monies
         if(!bot.smartMoving){
             try{
                 await bot.smartMove(monster);
                 await updateStats(bot);
                 await sellUnwantedItems(bot);
                 await bot.openMerchantStand();
             } catch (e) {
                 logger.error(e);
             }
         } else if (bot.smartMoving){
             await bot.closeMerchantStand();
         }
     }

 }

async function potionBulkBuy(m: Merchant){
    // Check if the merchant has 1000 of both MPOT0 and HPOT0
    if ((m.countItem("mpot0") < 400 )|| (m.countItem("hpot0") < 400)){
        potty = true;
        logger.info("We need to buy more potions")
        try {
            if (!m.smartMoving) {
                await m.smartMove("main")
                let mpotsToBuy = Math.min(1000 - m.countItem("mpot0"), m.gold / AL.Game.G.items.mpot0.g)
                if (mpotsToBuy > 0) await m.buy("mpot0", mpotsToBuy)
                let hpotsToBuy = Math.min(1000 - m.countItem("hpot0"), m.gold / AL.Game.G.items.hpot0.g)
                if (mpotsToBuy > 0) await m.buy("hpot0", hpotsToBuy)
                if ((m.countItem("mpot0") === 1000) && (m.countItem("hpot0") === 1000)){
                    potty = false;
                }
            }
        } catch(e){
            logger.error(e)
        }
    }
}

async function sellUnwantedItems(m: Merchant){
    if (m.isFull()){
        setTask(m.name, 'tooMuchShit');
    }


    if(m.isFull()){
        if (!m.smartMoving){
            await m.smartMove("main")
            for (let item of m.items) {
                if(!item) continue;
                if (!keepItems.includes(item.name)) {
                    logger.info("Selling Item " + item.name)
                    let itemSlot = m.locateItem(item.name);
                    await m.sell(itemSlot)
                }
            }
            await m.smartMove("bank")
            for (let item of m.items) {
                if(!item) continue;
                if (bank2Items.includes(item.name)) {
                    logger.info("Selling Item " + item.name)
                    let itemSlot = m.locateItem(item.name);
                    m.depositItem(itemSlot)
                }
            }
        }
    }
}

async function giveLuck(bot: Merchant) {
    if (bot.partyData){
        let party = bot.getPlayers({isPartyMember: true})
        for (let c in party){
            if (party[c] && !party[c].s.mluck){
                // The bot doesn't have luck, maybe we should give it to them.
                try{
                    if (!party[c].name || party[c].name === undefined) return;
                    // @ts-ignore
                    await bot.mluck(party[c].name)
                    logger.info(`${party[c].name} has been given mluck`);
                } catch (e) {
                    logger.warn(e)
                }
            }
        }
    }
}

export async function mechLogin(name: string) {
    logger.info(`Starting bot ${name}`)
    let bot = await AL.Game.startMerchant(name, "US", "I")
    logger.info(`${bot.name} logged in`)
    let sGold = bot.gold
    await goldTracker(bot, sGold)
    await runMerchantLoops(bot).then(async () => {
        await prisma.$disconnect();
    })
}

export async function upgradeItems(bot: Merchant, item: ItemName){
    let task = await getTask(bot.name)
    // console.log(`1 - ${task}`);
    // console.log(task)
    let numberToKeep = 2
    let items = bot.locateItems(item)
    // console.log(`2 - ${bot.gold}`);
    if (items.length > 10 && task == 'farm') {
        await setTask(bot.name,'upgrade')
    } else if (items.length <= numberToKeep && task == 'upgrade') {
        // we now need to keep them
        await setTask(bot.name, 'farm')
    }
    if (bot.gold >= 50000 && task === 'upgrade'){
        if (!bot.smartMoving){
            await bot.smartMove('scrolls');
            if ((bot.countItem('scroll0')) < 1){
                await bot.buy('scroll0', 10)
            }
            if ((bot.countItem("scroll1")) < 1){
                await bot.buy("scroll1", 10)
            }
            if(items.length > numberToKeep) {
                try{
                    let filteredItems = bot.items.filter(w => w != null)
                    // logger.info(filteredItems);
                    // @ts-ignore
                    const lowerstaff = bot.locateItem(item, bot.items, { returnLowestLevel: true })
                    console.log(lowerstaff)
                    // console.log(bot.items[lowerstaff])
                    // @ts-ignore
                    if (bot.items[lowerstaff] && bot.items[lowerstaff]?.level < 5){
                        let scrolls = bot.locateItem('scroll0')
                        await bot.useMPPot(bot.locateItem('mpot0'))
                        await bot.massProduction()
                        await bot.upgrade(lowerstaff, scrolls)
                        // @ts-ignore
                    } else if (bot.items[lowerstaff]?.level >= 5){
                        let scrolls = bot.locateItem('scroll1')
                        await bot.useMPPot(bot.locateItem('mpot0'))
                        await bot.massProduction()
                        await bot.upgrade(lowerstaff, scrolls)
                    }

                    // @ts-ignore
                    let highestItem = bot.locateItem(item, bot.items, { returnHighestLevel: true })
                    if (bot.items[lowerstaff]){
                        logger.info(`The ${item} has been upgraded to ${bot.items[lowerstaff]?.level}`)
                    } else {
                        logger.info('We lost the item')
                    }
                } catch (e) {
                    logger.error(e);
                }
            }
        }
    }
}

export async function giveHPPotions(bot: Merchant, character: string, num: number){
    let pots = bot.locateItem('hpot0');
    if (pots) {
        try {
            await bot.sendItem(character, pots, num)
        } catch (e) {
            logger.warn(e)
        }
    }

}

export async function giveMPPotions(bot: Merchant, character: string, num: number){
    let pots = bot.locateItem('mpot0');
    if (pots) {
        try {
            await bot.sendItem(character, pots, num)
        } catch (e) {
            logger.warn(e)
        }
    }

}

let potty = false;
