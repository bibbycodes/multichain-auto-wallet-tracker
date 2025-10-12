import { AutoTrackerToken } from "../../models/token";

export interface TelegramMessageServiceData {
    channelId: string;
    caption: string;
    photo?: string;
    token: AutoTrackerToken;
}

