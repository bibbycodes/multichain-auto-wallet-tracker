import { BirdeyeTimeInterval } from "../client/types";

export function intervalToMilliseconds(interval: BirdeyeTimeInterval): number {
  const intervalMap: { [key in BirdeyeTimeInterval]: number } = {
    "1h": 60 * 60 * 1000,
    "1m": 60 * 1000,
    "2h": 2 * 60 * 60 * 1000,
    "5m": 3 * 60 * 1000,
    "30m": 30 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "8h": 8 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
  };

  return intervalMap[interval];
}
