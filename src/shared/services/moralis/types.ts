export interface CreateStreamParams {
  webhookUrl: string;
  description: string;
  tag: string;
  chains: string[];
  includeNativeTxs: boolean;
}
