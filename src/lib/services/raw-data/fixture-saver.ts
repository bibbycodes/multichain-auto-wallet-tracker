import * as fs from 'fs';
import * as path from 'path';

export class FixtureSaver {
    private static readonly BASE_DIR = '/raw-data-jsons';

    /**
     * Save fixture data to a file
     * @param dataSource - The data source name (e.g., 'birdeye')
     * @param methodName - The method name (e.g., 'getTokenSecurity')
     * @param tokenAddress - The token address
     * @param data - The data to save
     */
    static async saveFixture(
        dataSource: string,
        methodName: string,
        tokenAddress: string,
        data: any
    ): Promise<void> {
        try {
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '-');
            const timeStr = now.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            const fileName = `${methodName}-${tokenAddress}-${dateStr}-${timeStr}.json`;
            const dirPath = path.join(process.cwd(), this.BASE_DIR, dataSource);
            const filePath = path.join(dirPath, fileName);

            // Ensure directory exists
            await fs.promises.mkdir(dirPath, { recursive: true });

            // Save the data
            await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Failed to save fixture for ${dataSource}.${methodName}:`, error);
            // Don't throw - fixture saving should not break the main flow
        }
    }
}
