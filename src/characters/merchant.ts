import AL, {Character, ItemData, ItemName, Merchant} from "alclient";
import logger from "../logger.js"
import { healthRegen, manaRegen } from "../utils/regen.js";
import {partyLeader} from "../utils/party.js";
import {goldTracker} from "../logger/gold.js";
import {setGold} from "../logger/prom.js";
import {PrismaClient} from "@prisma/client";

const keepItems = ["slimestaff","gslime","beewings","hpamulet","scroll0","seashell","ringsj","gem0","stand0","candy1"]
const bank2Items = ["gslime","beewings","seashell","gem0"]
const partyMembers = ["ephara","manarocks"]
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
        await upgradeItems(bot, 'slimestaff')
    }, 4000)

    setInterval(async () => {
        await manaRegen(bot);
    }, 1000)

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

async function bankItems(m: Merchant) {

}

async function giveLuck(bot: Merchant) {
    const target = bot.getPlayer({ canWalkTo: true, returnNearest: true, withinRange: "mluck", isNPC: false})
    if (!target) return;
    if (!target.s.mluck){
        if (!bot.isOnCooldown("mluck")){
        //    The bot can use MLUCK
            if (target.name){
                try{
                    await bot.mluck(target.name)
                    logger.info(`Gave ${target.name} mluck!`)
                } catch (e) {
                    logger.warn(e);
                }
            }
        }
    }
}

export async function mechLogin(name: string) {

    logger.info(`Starting bot ${name}`)
    let bot = await AL.Game.startMerchant(name, "EU", "II")
    logger.info(`${bot.name} logged in`)
    let sGold = bot.gold
    await goldTracker(bot, sGold)
    await runMerchantLoops(bot).then(async () => {
        await prisma.$disconnect();
    })
}

export async function upgradeItems(bot: Merchant, item: ItemName){
    let numberToKeep = 2
    let items = bot.locateItems(item)
    if (items.length > 6){
        if (!bot.smartMoving){
            await bot.smartMove('scrolls');
            if ((bot.countItem('scroll0')) < 10){
                await bot.buy('scroll0', 10)
            }
            if(items.length > numberToKeep) {
                try{
                    let filteredItems = bot.items.filter(w => w != null)
                    // logger.info(filteredItems);
                    // @ts-ignore
                    const lowerstaff = bot.locateItem(item, bot.items, { returnLowestLevel: true })
                    console.log(lowerstaff)
                    // console.log(bot.items[lowerstaff])
                    let scrolls = bot.locateItem('scroll0')
                    await bot.useMPPot(bot.locateItem('mpot0'))
                    await bot.massProduction()
                    await bot.upgrade(lowerstaff, scrolls)
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


let potty = false;
