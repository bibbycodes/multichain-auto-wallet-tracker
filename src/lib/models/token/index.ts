import { Prisma, TokenDataSource } from "@prisma/client";
import { GmGnMultiWindowTokenInfo, GmGnTokenSocials } from "python-proxy-scraper-client";
import { ChainId } from "../../../shared/chains";
import { GmGnMapper } from "../../services/apis/gmgn/gmgn-mapper";
import { MoralisMapper } from "../../services/apis/moralis/moralis-mapper";
import { MoralisEvmTokenMetaData, MoralisEvmTokenPrice } from "../../services/apis/moralis/types";
import { SocialMedia } from "../socials/types";
import { TokenData, TokenDataWithMarketCap } from "./types";
import { AutoTrackerTokenDataSource } from "./types";

export class AutoTrackerToken {
    address: string;
    chainId: ChainId;
    name: string;
    symbol: string;
    decimals: number;
    socials: SocialMedia;
    logoUrl?: string;
    description?: string;
    createdBy?: string;
    creationTime?: Date;
    createdAt: Date;
    updatedAt: Date;
    totalSupply: number;
    pairAddress: string;
    dataSource: AutoTrackerTokenDataSource;

    constructor(public data: TokenData) {
        this.address = data.address;
        this.chainId = data.chainId;
        this.name = data.name;
        this.symbol = data.symbol;
        this.decimals = data.decimals;
        this.socials = data.socials;
        this.logoUrl = data.logoUrl;
        this.description = data.description;
        this.createdBy = data.createdBy;
        this.creationTime = data.creationTime;
        this.pairAddress = data.pairAddress;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
        this.totalSupply = data.totalSupply;
        this.pairAddress = data.pairAddress;
        this.dataSource = data.dataSource;
    }

    toDb(): Prisma.TokenCreateInput {
        return {
            address: this.address,
            chain: {
                connect: {
                    chain_id: this.chainId.toString(),
                },
            },
            name: this.name,
            symbol: this.symbol,
            decimals: this.decimals,
            telegram_url: this.socials.telegram,
            twitter_url: this.socials.twitter,
            website_url: this.socials.website,
            description: this.description,
            logo_url: this.logoUrl,
            created_by: this.createdBy,
            creation_time: this.creationTime,
            total_supply: this.totalSupply.toString(),
            pair_address: this.pairAddress,
            data_source: this.dataSourceToEnum(this.dataSource),
        }
    }

    dataSourceToEnum(dataSource: AutoTrackerTokenDataSource): TokenDataSource {
        switch (dataSource) {
            case AutoTrackerTokenDataSource.BIRDEYE:
                return TokenDataSource.BIRDEYE;
            case AutoTrackerTokenDataSource.GMGN:
                return TokenDataSource.GMGN;
            case AutoTrackerTokenDataSource.MORALIS:
                return TokenDataSource.MORALIS;
        }
    }

    toJson() {
        return JSON.stringify({
            address: this.address,
            chainId: this.chainId,
            name: this.name,
            symbol: this.symbol,
            decimals: this.decimals,
            socials: this.socials,
            logoUrl: this.logoUrl,
            description: this.description,
            createdBy: this.createdBy,
            creationTime: this.creationTime,
            pairAddress: this.pairAddress,
            createdAt: this.createdAt ?? new Date(),
            updatedAt: this.updatedAt ?? new Date(),
        })
    }

    static fromGmGnToken({
        gmGnMultiWindowTokenInfo,
        gmgnTokenSocials,
        chainId,
    }: {
        gmGnMultiWindowTokenInfo: GmGnMultiWindowTokenInfo,
        gmgnTokenSocials: GmGnTokenSocials,
        chainId: ChainId,
    }): AutoTrackerToken {
        return GmGnMapper.mapGmGnTokenToAutoTrackerToken(gmGnMultiWindowTokenInfo, gmgnTokenSocials, chainId)
    }

    static fromTokenDataWithMarketCap(tokenData: TokenDataWithMarketCap): AutoTrackerToken {
        return new AutoTrackerToken(tokenData)
    }

    static fromMoralisToken({
        moralisToken,
        tokenPrice,
        chainId,
    }: {
        moralisToken: MoralisEvmTokenMetaData,
        tokenPrice: MoralisEvmTokenPrice,
        chainId: ChainId,
    }): AutoTrackerToken {
        return MoralisMapper.mapMoralisTokenToAutoTrackerToken(moralisToken, tokenPrice, chainId)
    }
}