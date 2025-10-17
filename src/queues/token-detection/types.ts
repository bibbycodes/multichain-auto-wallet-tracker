import { TelegramMessageData } from "../../lib/data-sources/telegram-message-processor/types";
import { AutoTrackerTokenData } from "../../lib/models/token/types";
import { BaseQueueJobData, BaseQueueJobResult } from "../types";

export enum TokenDetectionJobTypes {
    PROCESS_TELEGRAM_TOKEN_DETECTION = 'process_telegram_token_detection',
}

export interface TokenDetectionJobData<T = any> extends BaseQueueJobData<TokenDetectionJobTypes, T> {}

export interface TokenDetectionJobResult<T = any> extends BaseQueueJobResult<TokenDetectionJobTypes, T> {}

export interface TelegramTokenDetectionJobData {
    tokenData: Partial<AutoTrackerTokenData>;
    messageData: TelegramMessageData;
}
