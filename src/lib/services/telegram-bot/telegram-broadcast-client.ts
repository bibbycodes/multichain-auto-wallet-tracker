import { Telegraf } from 'telegraf';
import { env } from '../util/env/env';
import { Singleton } from '../util/singleton';
import { SendMessageParams, SendPhotoParams, BroadcastParams, MessageOptions } from './types';

export class TelegramBroadcastClient extends Singleton {
  private bot: Telegraf;

  constructor(botToken: string = env.telegram.wbbBscBotToken) {
    super();
    this.bot = new Telegraf(botToken);
  }

  /**
   * Send a text message with HTML formatting
   */
  async sendMessage(params: SendMessageParams): Promise<void> {
    const { channelId, text, disableWebPagePreview, disableNotification } = params;
    try {
      await this.bot.telegram.sendMessage(channelId, text, {
        parse_mode: 'HTML',
        link_preview_options: disableWebPagePreview 
          ? { is_disabled: true }
          : undefined,
        disable_notification: disableNotification ?? false,
      });
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      throw error;
    }
  }

  /**
   * Send a photo with HTML formatted caption
   * Falls back to sending text message if photo fails
   */
  async sendPhoto(params: SendPhotoParams): Promise<void> {
    const { channelId, photoUrl, caption, disableNotification } = params;
    try {
      await this.bot.telegram.sendPhoto(
        channelId,
        photoUrl,
        {
          caption: caption,
          parse_mode: caption ? 'HTML' : undefined,
          disable_notification: disableNotification ?? false,
        }
      );
    } catch (error) {
      await this.sendMessage({
        channelId,
        text: caption,
        disableNotification,
      });
    }
  }

  /**
   * Send a message with optional photo
   * If photoUrl is provided, sends photo with text as caption
   * Otherwise, sends text message
   */
  async broadcast(params: BroadcastParams): Promise<void> {
    const { channelId, text, photoUrl, disableWebPagePreview = true, disableNotification = false } = params;
    if (photoUrl) {
      await this.sendPhoto({
        channelId,
        photoUrl,
        caption: text,
        disableNotification,
      });
    } else {
      await this.sendMessage({
        channelId,
        text,
        disableWebPagePreview,
        disableNotification,
      });
    }
  }

  /**
   * Get the bot instance for advanced usage
   */
  getBot(): Telegraf {
    return this.bot;
  }
}

