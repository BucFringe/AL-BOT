import {PrismaClient} from "@prisma/client";
import {Character, Merchant} from "alclient";


const prisma = new PrismaClient();

export async function dbConnect(){
    await prisma.$connect();
}

export async function getconfig(botName: string){
    // Get the config for one bot.
    let config = await prisma.charconfig.findFirst({
        where: {
            name: botName
        }
    })
    if (!config) return null;
    return config;
}
export async function getTask(botName: string) {
    let config = await prisma.charconfig.findFirst({
        where: {
            name: botName
        }
    })
    if (!config) return;
    return config.task;
}

export async function setTask(botName: string, newTask: string) {
    let unid = await prisma.charconfig.findFirst({
        where: {name: botName}
    })
    if (!unid) return false;
    let id = unid.id
    // @ts-ignore
    let config = await prisma.charconfig.update({
        where: { //@ts-ignore
            id
        },
        data: {
            task: newTask
        }
    })
}

// export async function updateLogStats(bot: Character) {
//     if (!bot.ready) return;
//     let trash = {
//         "name": bot.name,
//         "level": bot.level,
//         "xp": bot.xp,
//         "mana": bot.mp,
//         "max_mana": bot.max_mp,
//         "health": bot.hp,
//         "items": bot.items,
//     }
//     try {
//         let unid = await prisma.charStats.findFirst({
//             where: {name: bot.name}
//         })
//         let items = bot.items
//         if (!unid || !bot) return false;
//         let id = unid.id
//         // @ts-ignore
//         await prisma.charStats.update({
//             where: { //@ts-ignore
//                 id
//             },
//             data: {
//                 "name": bot.name,
//                 //@ts-ignore
//                 "level": bot.level,
//                 "xp": bot.xp,
//                 "mana": bot.mp,
//                 "max_mana": bot.max_mp,
//                 "health": bot.hp,
//                 "items": items,
//             }
//         })
//     } catch (e) {
//         console.error(e)
//     }
//
// }