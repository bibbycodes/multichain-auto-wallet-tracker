import { BaseQueueJobData, BaseQueueJobResult } from "../types";

export enum TelegramMessageJobTypes {
    SEND_ALERT = 'SEND_ALERT',
}

export interface TelegramMessageJobData<T = any> extends BaseQueueJobData<TelegramMessageJobTypes, T> {}

export interface TelegramMessageJobResult<T = any> extends BaseQueueJobResult<TelegramMessageJobTypes, T> {}

export interface SendMessageToChannelData {
    channelId: string;
    caption: string;
    photo?: string;
    token: any; // Serialized AutoTrackerToken
}

