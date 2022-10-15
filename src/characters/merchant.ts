import AL, { Character, Merchant } from "alclient";
import logger from "../logger.js"
import { healthRegen, manaRegen } from "../utils/regen.js";

const keepItems = ["slimestaff","gslime","beewings","hpamulet","scroll0","seashell","ringsj","gem0","stand0"]
const bank2Items = ["gslime","beewings","seashell","gem0"]

async function runMerchant(bot: Merchant){
    if (!bot) return;
    if (bot.rip){
        logger.warn(`${bot.name} is dead`)
        try{
            await bot.respawn();
        } catch (e){
            logger.error(e);
        }
    }
    if (bot.ready && !bot.rip) {
        healthRegen(bot);
        manaRegen(bot);
        potionBulkBuy(bot);
        if (potty === false) { // We don't need to buy potions
            if (!bot.smartMoving){
                await bot.smartMove("goo")
            }
            await sellUnwantedItems(bot)
        }
        // logger.info(potty)
    }

    setTimeout(async () => {
        await runMerchant(bot), 1000})
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

export async function mechLogin(name: string) {
    logger.info(`Starting bot ${name}`)
    let bot = await AL.Game.startMerchant(name, "EU", "II")
    logger.info(`${bot.name} logged in`)
    await runMerchant(bot)
}

let potty = false;
