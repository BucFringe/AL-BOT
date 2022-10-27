import AL, { Character } from "alclient"
import { mageLogin } from "./characters/mage.js"
import { mechLogin } from "./characters/merchant.js"
import {runProm} from "./logger/prom.js";
import {priestLogin} from "./characters/priest.js";


async function run() {
    await Promise.all([AL.Game.loginJSONFile("./credentials.json"), AL.Game.getGData()]);
    await AL.Pathfinder.prepare(AL.Game.G);

    await mechLogin("stevenly");
    await mageLogin("ephara");
    await mageLogin("manarocks");
    await priestLogin("lotsofheals", "US","I");

}

await run()
await runProm()