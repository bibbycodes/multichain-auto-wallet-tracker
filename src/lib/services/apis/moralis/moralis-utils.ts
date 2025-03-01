import {ethers} from "ethers";
import Web3 from "web3";

export function deriveTopic(abi: any[], eventName: string): string {
  const event = abi.find(item => item.name === eventName && item.type === "event");

  if (!event) {
    throw new Error(`Event ${eventName} not found in ABI.`);
  }

  const parameterTypes = event.inputs.map((input: any) => input.type);
  return `${eventName}(${parameterTypes.join(',')})`;
}

export function deriveTopicSha3(abi: any[], eventName: string): string {
  const web3 = new Web3()
  return web3.utils.sha3(deriveTopic(abi, eventName)) as string
}

export function toHex(num: number): string {
  const hexValue = num.toString(16); // Convert number to hexadecimal
  return `0x${hexValue.toUpperCase()}`; // Return in the format '0xHEX'
}
