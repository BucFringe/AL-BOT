import AL from "alclient"

async function run() {
    await Promise.all([AL.Game.loginJSONFile("./credentials.json"), AL.Game.getGData()])
    await AL.Pathfinder.prepare(AL.Game.G)

    const merchant = await AL.Game.startMerchant("stevenly", "EU", "II")
    console.log("Moving to main")
    await merchant.smartMove("main")
    console.log("Moving to cyberland")
    await merchant.smartMove("cyberland")
    console.log("Moving to halloween")
    await merchant.smartMove("halloween")

    merchant.disconnect()
}
run()