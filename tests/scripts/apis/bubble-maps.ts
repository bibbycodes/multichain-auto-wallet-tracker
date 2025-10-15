import { BubbleMapsClient, InsightXClient } from "python-proxy-scraper-client";

const tokenAddress = '0x356A40Dcca91703bE01eBEbaCd7C4f3884804444'
const chain = '56'

export const getBubbleMaps = async () => {
    const bubbleMapsClient = new BubbleMapsClient()
    const bubbleMaps = await bubbleMapsClient.getBubbleMapsGraph(
        tokenAddress,
        chain,
        true
    )
    console.log(bubbleMaps)
}

export const getInsightX = async () => {
    const insightXClient = new InsightXClient()
    const insightX = await insightXClient.getBubblemap(
        chain,
        tokenAddress
    )
    console.log(JSON.stringify(insightX))
}

// getBubbleMaps()
getInsightX()