import client from 'prom-client';
import express from 'express';
import {Character, ItemName} from "alclient";

const register = new client.Registry();
const keepItems: ItemName[] = ['slimestaff']

export async function runProm() {
    register.setDefaultLabels({
        app: 'adventureland-bot'
    });
    //client.collectDefaultMetrics({ register });

    const app = express();

    app.get('/metrics', async (req: any, res: any) => {
        res.set('content-type', register.contentType);
        res.end(await register.metrics());
    });

    app.listen(3001, () => {
        console.log("Started metrics server on port 3000")
    })
}

function newGauge(name: string, help: string): client.Gauge<'character' | 'character_type'> {
    return new client.Gauge({
        name,
        help,
        labelNames: ['character', 'character_type'],
        registers: [register],
    });
}

function newItemGauge(name: string, help:string): client.Gauge<'character' | 'character_' | 'item_name'> {
    return new client.Gauge({
        name,
        help,
        labelNames: ['character', 'character_type', 'item_name'],
        registers: [register],
    });
}

// Setting up the gauges
const goldGauge = newGauge('gold', 'The Gold of the Character');
const xpGauge = newGauge('xp', 'The Xp of the Characters')
const manaGuage = newGauge('mana','The current mana of the bot')
const maxMPGauge = newGauge('maxmp', 'The Max MP of the bot')
const levelGauge = newGauge('level', 'The Level of the bot')
const itemGauge = newItemGauge('item', 'The Highest Item Level')

export async function updateStats(bot: Character){
    const labels = {character: bot.name, character_type: bot.ctype};
    goldGauge.labels(labels).set(bot.gold);
    xpGauge.labels(labels).set(bot.xp);
    manaGuage.labels(labels).set(bot.mp);
    maxMPGauge.labels(labels).set(bot.max_mp);
    levelGauge.labels(labels).set(bot.level);
}
export async function updateItemStats(bot: Character){
    keepItems.forEach(i => {
        // @ts-ignore
        let item = bot.locateItem(i, bot.items, {
            returnHighestLevel: true
        })
        if(!item || item === undefined) return;
        let labels = {character: bot.name, character_type: bot.ctype, item_name: bot.items[item]?.name}
        itemGauge.labels(labels).set(<number>bot.items[item]?.level)
    })
}
