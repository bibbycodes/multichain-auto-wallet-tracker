import { TelegramMessageData } from "../../lib/services/telegram-message-processor/types";
import { BaseQueueJobData, BaseQueueJobResult } from "../types";

export enum TokenDetectionJobTypes {
    PROCESS_TELEGRAM_TOKEN_DETECTION = 'process_telegram_token_detection',
}

export interface TokenDetectionJobData<T = any> extends BaseQueueJobData<TokenDetectionJobTypes, T> {}

export interface TokenDetectionJobResult<T = any> extends BaseQueueJobResult<TokenDetectionJobTypes, T> {}

export interface TelegramTokenDetectionJobData {
    tokenAddress: string;
    messageData: TelegramMessageData;
}
