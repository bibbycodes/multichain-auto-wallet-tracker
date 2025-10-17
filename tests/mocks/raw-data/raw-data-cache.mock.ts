import { ChainId } from "../../../src/shared/chains";
import { RawDataData } from "../../../src/lib/services/raw-data/types";
import { BirdeyeRawTokenDataMock } from "../birdeye/birdeye-raw-data.mock";
import { GmgnRawDataSourceMock } from "../gmgn/gmgn-raw-data.mock";
import { ChainBaseRawDataMock } from "../chainbase/chainbase-raw-data.mock";

export class RawTokenDataCacheMock {
  public readonly birdeye: BirdeyeRawTokenDataMock;
  public readonly gmgn: GmgnRawDataSourceMock;
  public readonly chainBase: ChainBaseRawDataMock;
  public readonly chainId: ChainId;
  public readonly tokenAddress: string;

  constructor(
    tokenAddress: string,
    chainId: ChainId,
    data?: RawDataData,
  ) {
    this.birdeye = new BirdeyeRawTokenDataMock(tokenAddress, chainId, data?.birdeye);
    this.gmgn = new GmgnRawDataSourceMock(tokenAddress, chainId, data?.gmgn);
    this.chainBase = new ChainBaseRawDataMock(tokenAddress, chainId, data?.chainBase);
    this.chainId = chainId;
    this.tokenAddress = tokenAddress;
  }

  // Jest mock functions for all methods
  collect = jest.fn().mockResolvedValue(undefined);

  getPrice = jest.fn().mockImplementation(async () => {
    const [birdeyePrice, gmgnPrice] = await Promise.all([
      this.birdeye.getPrice(),
      this.gmgn.getPrice(),
    ]);
    return birdeyePrice ?? gmgnPrice ?? null;
  });

  getMarketCap = jest.fn().mockImplementation(async () => {
    const [birdeyeMarketCap, gmgnMarketCap] = await Promise.all([
      this.birdeye.getMarketCap(),
      this.gmgn.getMarketCap(),
    ]);
    return birdeyeMarketCap ?? gmgnMarketCap ?? null;
  });

  getLiquidity = jest.fn().mockImplementation(async () => {
    const [birdeyeLiquidity, gmgnLiquidity] = await Promise.all([
      this.birdeye.getLiquidity(),
      this.gmgn.getLiquidity(),
    ]);
    return birdeyeLiquidity ?? gmgnLiquidity ?? null;
  });

  getSupply = jest.fn().mockImplementation(async () => {
    const [birdeyeSupply, gmgnSupply] = await Promise.all([
      this.birdeye.getSupply(),
      this.gmgn.getSupply(),
    ]);
    return birdeyeSupply ?? gmgnSupply ?? null;
  });

  getDecimals = jest.fn().mockImplementation(async () => {
    const [birdeyeDecimals, gmgnDecimals] = await Promise.all([
      this.birdeye.getDecimals(),
      this.gmgn.getDecimals(),
    ]);
    return birdeyeDecimals ?? gmgnDecimals ?? null;
  });

  getName = jest.fn().mockImplementation(async () => {
    const [birdeyeName, gmgnName] = await Promise.all([
      this.birdeye.getName(),
      this.gmgn.getName(),
    ]);
    return birdeyeName ?? gmgnName ?? null;
  });

  getSymbol = jest.fn().mockImplementation(async () => {
    const [birdeyeSymbol, gmgnSymbol] = await Promise.all([
      this.birdeye.getSymbol(),
      this.gmgn.getSymbol(),
    ]);
    return birdeyeSymbol ?? gmgnSymbol ?? null;
  });

  getLogoUrl = jest.fn().mockImplementation(async () => {
    const [birdeyeLogo, gmgnLogo] = await Promise.all([
      this.birdeye.getLogoUrl(),
      this.gmgn.getLogoUrl(),
    ]);
    return birdeyeLogo ?? gmgnLogo ?? null;
  });

  getDescription = jest.fn().mockImplementation(async () => {
    const [birdeyeDescription, gmgnDescription] = await Promise.all([
      this.birdeye.getDescription(),
      this.gmgn.getDescription(),
    ]);
    return birdeyeDescription ?? gmgnDescription ?? null;
  });

  getSocials = jest.fn().mockImplementation(async () => {
    const [birdeyeSocials, gmgnSocials] = await Promise.all([
      this.birdeye.getSocials(),
      this.gmgn.getSocials(),
    ]);
    return birdeyeSocials ?? gmgnSocials ?? null;
  });

  getCreatedBy = jest.fn().mockImplementation(async () => {
    const [birdeyeCreatedBy, gmgnCreatedBy] = await Promise.all([
      this.birdeye.getCreatedBy(),
      this.gmgn.getCreatedBy(),
    ]);
    return birdeyeCreatedBy ?? gmgnCreatedBy ?? null;
  });

  getTopHolders = jest.fn().mockImplementation(async () => {
    const [birdeyeHolders, gmgnHolders, chainBaseHolders] = await Promise.all([
      this.birdeye.getTopHolders?.(),
      this.gmgn.getHolders?.(),
      this.chainBase.getTopHolders(),
    ]);
    return chainBaseHolders ?? gmgnHolders ?? birdeyeHolders ?? null;
  });

  getRawData = jest.fn().mockImplementation(() => ({
    birdeye: this.birdeye.getRawData(),
    gmgn: this.gmgn.getRawData(),
    chainBase: this.chainBase.getRawData(),
  } as RawDataData));

  updateData = jest.fn().mockImplementation((data: Partial<RawDataData>) => {
    if (data.birdeye) {
      this.birdeye.updateData(data.birdeye);
    }
    if (data.gmgn) {
      this.gmgn.updateData(data.gmgn);
    }
    if (data.chainBase) {
      this.chainBase.updateData(data.chainBase);
    }
  });

  toObject = jest.fn().mockImplementation(() => ({
    birdeye: this.birdeye.toObject(),
    gmgn: this.gmgn.toObject(),
    chainBase: this.chainBase.toObject(),
  } as RawDataData));
}
