import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { TokenDetectionQueue } from './token-detection/token-detection-queue';
import { TelegramMessageQueue } from './telegram-message/telegram-message-queue';

export class QueueDashboard {
    private serverAdapter: ExpressAdapter;

    constructor() {
        this.serverAdapter = new ExpressAdapter();
        this.setupDashboard();
    }

    private setupDashboard(): void {
        try {
            // Get queue instances
            const tokenDetectionQueue = TokenDetectionQueue.getInstance();
            const telegramMessageQueue = TelegramMessageQueue.getInstance();
            // Set base path to match the mount point
            this.serverAdapter.setBasePath('/admin/queues');

            // Create Bull Board
            createBullBoard({
                queues: [
                    new BullMQAdapter(tokenDetectionQueue.queue),
                    new BullMQAdapter(telegramMessageQueue.queue),
                ],
                serverAdapter: this.serverAdapter,
                options: {
                    uiConfig: {
                        miscLinks: [
                            {
                                text: 'Queue Stats',
                                url: '/admin/api/queue-stats',
                            },
                        ],
                    },
                },
            });
            
            console.log('Bull Board dashboard setup complete - mount at /admin/queues');
        } catch (error) {
            console.error('Error setting up dashboard:', error);
        }
    }

    public getRouter() {
        return this.serverAdapter.getRouter();
    }

    public async getQueueStats() {
        try {
            const tokenDetectionQueue = TokenDetectionQueue.getInstance();
            const telegramMessageQueue = TelegramMessageQueue.getInstance();
            
            const [tokenDetectionStats, telegramMessageStats] = await Promise.all([
                tokenDetectionQueue.getStats(),
                telegramMessageQueue.getStats(),
            ]);

            return {
                tokenDetection: tokenDetectionStats,
                telegramMessage: telegramMessageStats,
            };
        } catch (error) {
            throw new Error(`Failed to fetch queue stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
