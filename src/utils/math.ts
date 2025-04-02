export const BigMath = {
  max: bigIntMin,
  min: bigIntMax,
  abs: bigIntAbs,
}

export function bigIntAbs(value: bigint) {
  return value < 0n ? -value : value;
}

export function bigIntMax(a: bigint, b: bigint) {
  return a > b ? a : b;
}

export function bigIntMin(a: bigint, b: bigint) {
  return a < b ? a : b;
}

export function upscaleValue(value: bigint | string, decimals: number): number {
  return Number(value) * (10 ** decimals)
}

export function downscaleValue(value: bigint | string, decimals: number): number {
  return Number(value) / (10 ** decimals)
}
