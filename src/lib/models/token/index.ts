import { Prisma, Token, TokenDataSource } from "@prisma/client";
import { GmGnMultiWindowTokenInfo, GmGnTokenSocials } from "python-proxy-scraper-client";
import { ChainId } from "../../../shared/chains";
import { deepMergeAll } from "../../../utils/data-aggregator";
import { BirdeyeMapper } from "../../services/apis/birdeye/birdeye-mapper";
import { BirdeyeEvmTokenSecurity, BirdeyeSolanaTokenSecurity, BirdTokenEyeOverview } from "../../services/apis/birdeye/client/types";
import { GmGnMapper } from "../../services/apis/gmgn/gmgn-mapper";
import { MoralisMapper } from "../../services/apis/moralis/moralis-mapper";
import { MoralisEvmTokenMetaData, MoralisEvmTokenPrice } from "../../services/apis/moralis/types";
import { SocialMedia } from "../socials/types";
import { TokenData, TokenDataWithMarketCap } from "./types";

export class AutoTrackerToken {
    public static readonly requiredFields = ['address', 'name', 'symbol', 'chainId', 'pairAddress', 'decimals', 'totalSupply']
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
    dataSource: TokenDataSource;

    constructor(data: TokenData) {
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
            data_source: this.dataSource,
        }
    }

    static fromDb(token: Token): AutoTrackerToken {
        return new AutoTrackerToken({
            address: token.address,
            chainId: token.chain_id as ChainId,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            socials: {
                telegram: token.telegram_url ?? undefined,
                twitter: token.twitter_url ?? undefined,
                website: token.website_url ?? undefined,
            },
            logoUrl: token.logo_url ?? undefined,
            description: token.description ?? undefined,
            createdBy: token.created_by ?? undefined,
            creationTime: token.creation_time ?? undefined,
            pairAddress: token.pair_address ?? undefined,
            createdAt: token.created_at ?? undefined,
            updatedAt: token.updated_at ?? undefined,
            totalSupply: Number(token.total_supply),
            dataSource: token.data_source,
        })
    }
    
    toJson() {
        return JSON.stringify(this.toObject())
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

    static fromBirdeyeToken({
        tokenOverview,
        tokenSecurity,
        pairAddress,
        chainId,
    }: {
        tokenOverview: BirdTokenEyeOverview,
        tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity,
        pairAddress: string,
        chainId: ChainId,
    }): AutoTrackerToken {
        return BirdeyeMapper.mapBirdeyeTokenToAutoTrackerToken(tokenOverview, tokenSecurity, pairAddress, chainId)
    }

    static mergeTokens(tokens: AutoTrackerToken[]): AutoTrackerToken {
        const tokenDatas = tokens.map(token => token.toObject())
        return new AutoTrackerToken(deepMergeAll(tokenDatas) as TokenData)
    }

    static validate(token: AutoTrackerToken) {
        const missingFields = AutoTrackerToken.requiredFields.filter(field => token[field as keyof AutoTrackerToken] === undefined || token[field as keyof AutoTrackerToken] === null)
        if (missingFields.length > 0) {
            console.log(token)
            throw new Error(
                `Invalid AutoTrackerToken for ${token.address || 'unknown'}: missing or invalid fields: ${missingFields.join(', ')}`
            )
        }
    }

    toObject(): TokenData {
        return {
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
            totalSupply: this.totalSupply,
            dataSource: this.dataSource,
            createdAt: this.createdAt ?? new Date(),
            updatedAt: this.updatedAt ?? new Date(),
        }
    }

    hasMissingRequiredFields(): boolean {
        return AutoTrackerToken.requiredFields.some(field => this[field as keyof AutoTrackerToken] === undefined || this[field as keyof AutoTrackerToken] === null)
    }
}