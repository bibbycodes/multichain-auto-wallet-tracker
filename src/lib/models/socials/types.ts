import { SocialPlatform } from "@prisma/client"

export interface SocialMedia {
    twitter?: string
    website?: string
    instagram?: string
    facebook?: string
    youtube?: string
    tiktok?: string
    linkedin?: string
    github?: string
    reddit?: string
    twitch?: string
    pinterest?: string
    discord?: string
    telegram?: string
  }

  export interface SocialChannel {
    id: string;
    platform: SocialPlatform;
    url: string;
    idOnPlatform: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
  }