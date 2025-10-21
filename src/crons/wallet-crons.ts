import cron from 'node-cron'
import { getWalletsToTrack } from '../scripts/get-wallets-to-track'

export const startWalletCron = () => {
    const job = cron.schedule('0 */2 * * *', getWalletsToTrack, {
        scheduled: true,
        timezone: 'UTC'
    })

    console.log('Wallet cron job scheduled to run every 2 hours')
    return job
}

startWalletCron()