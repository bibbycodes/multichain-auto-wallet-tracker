export interface MessageOptions {
  disableWebPagePreview?: boolean;
  disableNotification?: boolean;
}

export interface SendMessageParams {
  channelId: string;
  text: string;
  disableWebPagePreview?: boolean;
  disableNotification?: boolean;
}

export interface SendPhotoParams {
  channelId: string;
  photoUrl: string;
  caption: string;
  disableNotification?: boolean;
}

export interface BroadcastParams {
  channelId: string;
  text: string;
  photoUrl?: string;
  disableWebPagePreview?: boolean;
  disableNotification?: boolean;
}

