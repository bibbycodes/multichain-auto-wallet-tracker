export const swapEventAbi = {
  anonymous: false,
  inputs: [
    {
      "indexed": true,
      "name": "sender",
      "type": "address"
    },
    {
      "indexed": true,
      "name": "to",
      "type": "address"
    },
    {
      "name": "amount0In",
      "type": "uint256"
    },
    {
      "name": "amount1In",
      "type": "uint256"
    },
    {
      "name": "amount0Out",
      "type": "uint256"
    },
    {
      "name": "amount1Out",
      "type": "uint256"
    }
  ],
  name: "Swap",
  type: "event"
};
