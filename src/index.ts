import AL, { Character } from "alclient"
import { mageLogin } from "./characters/mage.js"
import { mechLogin } from "./characters/merchant.js"
import promClient from 'prom-client';
import express from "express";


const register = new promClient.Registry()

// Add a default label which is added to all metrics
register.setDefaultLabels({
    app: 'example-nodejs-app'
})

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register })

const app = express();

async function run() {
    await Promise.all([AL.Game.loginJSONFile("./credentials.json"), AL.Game.getGData()]);
    await AL.Pathfinder.prepare(AL.Game.G);

    await mechLogin("stevenly", register);
    await mageLogin("ephara");


}

run()
app.get('/metrics', async (req: any, res: any) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

app.listen(3000)