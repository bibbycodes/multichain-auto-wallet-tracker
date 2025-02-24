import Web3 from 'web3';

// The UniLikeV2 Router contract address on BSC
const routerAddress = '0x05fF61A0faeA54f378D11F4e4E155FBa5148F072'; // Replace with the correct contract address
// The ABI (Application Binary Interface) of the contract
const abi = [{
  "inputs": [{"internalType": "address", "name": "_factory", "type": "address"}, {
    "internalType": "address",
    "name": "_WETH",
    "type": "address"
  }], "stateMutability": "nonpayable", "type": "constructor"
}, {
  "inputs": [],
  "name": "WETH",
  "outputs": [{"internalType": "address", "name": "", "type": "address"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "tokenA", "type": "address"}, {
    "internalType": "address",
    "name": "tokenB",
    "type": "address"
  }, {"internalType": "uint256", "name": "amountADesired", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountBDesired",
    "type": "uint256"
  }, {"internalType": "uint256", "name": "amountAMin", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountBMin",
    "type": "uint256"
  }, {"internalType": "address", "name": "to", "type": "address"}, {
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
  }],
  "name": "addLiquidity",
  "outputs": [{"internalType": "uint256", "name": "amountA", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountB",
    "type": "uint256"
  }, {"internalType": "uint256", "name": "liquidity", "type": "uint256"}],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "token", "type": "address"}, {
    "internalType": "uint256",
    "name": "amountTokenDesired",
    "type": "uint256"
  }, {"internalType": "uint256", "name": "amountTokenMin", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountETHMin",
    "type": "uint256"
  }, {"internalType": "address", "name": "to", "type": "address"}, {
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
  }],
  "name": "addLiquidityETH",
  "outputs": [{"internalType": "uint256", "name": "amountToken", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountETH",
    "type": "uint256"
  }, {"internalType": "uint256", "name": "liquidity", "type": "uint256"}],
  "stateMutability": "payable",
  "type": "function"
}, {
  "inputs": [],
  "name": "factory",
  "outputs": [{"internalType": "address", "name": "", "type": "address"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountOut", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "reserveIn",
    "type": "uint256"
  }, {"internalType": "uint256", "name": "reserveOut", "type": "uint256"}],
  "name": "getAmountIn",
  "outputs": [{"internalType": "uint256", "name": "amountIn", "type": "uint256"}],
  "stateMutability": "pure",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountIn", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "reserveIn",
    "type": "uint256"
  }, {"internalType": "uint256", "name": "reserveOut", "type": "uint256"}],
  "name": "getAmountOut",
  "outputs": [{"internalType": "uint256", "name": "amountOut", "type": "uint256"}],
  "stateMutability": "pure",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountOut", "type": "uint256"}, {
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
  }],
  "name": "getAmountsIn",
  "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountIn", "type": "uint256"}, {
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
  }],
  "name": "getAmountsOut",
  "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountA", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "reserveA",
    "type": "uint256"
  }, {"internalType": "uint256", "name": "reserveB", "type": "uint256"}],
  "name": "quote",
  "outputs": [{"internalType": "uint256", "name": "amountB", "type": "uint256"}],
  "stateMutability": "pure",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "tokenA", "type": "address"}, {
    "internalType": "address",
    "name": "tokenB",
    "type": "address"
  }, {"internalType": "uint256", "name": "liquidity", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountAMin",
    "type": "uint256"
  }, {"internalType": "uint256", "name": "amountBMin", "type": "uint256"}, {
    "internalType": "address",
    "name": "to",
    "type": "address"
  }, {"internalType": "uint256", "name": "deadline", "type": "uint256"}],
  "name": "removeLiquidity",
  "outputs": [{"internalType": "uint256", "name": "amountA", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountB",
    "type": "uint256"
  }],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "token", "type": "address"}, {
    "internalType": "uint256",
    "name": "liquidity",
    "type": "uint256"
  }, {"internalType": "uint256", "name": "amountTokenMin", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountETHMin",
    "type": "uint256"
  }, {"internalType": "address", "name": "to", "type": "address"}, {
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
  }],
  "name": "removeLiquidityETH",
  "outputs": [{"internalType": "uint256", "name": "amountToken", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountETH",
    "type": "uint256"
  }],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "token", "type": "address"}, {
    "internalType": "uint256",
    "name": "liquidity",
    "type": "uint256"
  }, {"internalType": "uint256", "name": "amountTokenMin", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountETHMin",
    "type": "uint256"
  }, {"internalType": "address", "name": "to", "type": "address"}, {
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
  }],
  "name": "removeLiquidityETHSupportingFeeOnTransferTokens",
  "outputs": [{"internalType": "uint256", "name": "amountETH", "type": "uint256"}],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "token", "type": "address"}, {
    "internalType": "uint256",
    "name": "liquidity",
    "type": "uint256"
  }, {"internalType": "uint256", "name": "amountTokenMin", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountETHMin",
    "type": "uint256"
  }, {"internalType": "address", "name": "to", "type": "address"}, {
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
  }, {"internalType": "bool", "name": "approveMax", "type": "bool"}, {
    "internalType": "uint8",
    "name": "v",
    "type": "uint8"
  }, {"internalType": "bytes32", "name": "r", "type": "bytes32"}, {
    "internalType": "bytes32",
    "name": "s",
    "type": "bytes32"
  }],
  "name": "removeLiquidityETHWithPermit",
  "outputs": [{"internalType": "uint256", "name": "amountToken", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountETH",
    "type": "uint256"
  }],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "token", "type": "address"}, {
    "internalType": "uint256",
    "name": "liquidity",
    "type": "uint256"
  }, {"internalType": "uint256", "name": "amountTokenMin", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountETHMin",
    "type": "uint256"
  }, {"internalType": "address", "name": "to", "type": "address"}, {
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
  }, {"internalType": "bool", "name": "approveMax", "type": "bool"}, {
    "internalType": "uint8",
    "name": "v",
    "type": "uint8"
  }, {"internalType": "bytes32", "name": "r", "type": "bytes32"}, {
    "internalType": "bytes32",
    "name": "s",
    "type": "bytes32"
  }],
  "name": "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens",
  "outputs": [{"internalType": "uint256", "name": "amountETH", "type": "uint256"}],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "tokenA", "type": "address"}, {
    "internalType": "address",
    "name": "tokenB",
    "type": "address"
  }, {"internalType": "uint256", "name": "liquidity", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountAMin",
    "type": "uint256"
  }, {"internalType": "uint256", "name": "amountBMin", "type": "uint256"}, {
    "internalType": "address",
    "name": "to",
    "type": "address"
  }, {"internalType": "uint256", "name": "deadline", "type": "uint256"}, {
    "internalType": "bool",
    "name": "approveMax",
    "type": "bool"
  }, {"internalType": "uint8", "name": "v", "type": "uint8"}, {
    "internalType": "bytes32",
    "name": "r",
    "type": "bytes32"
  }, {"internalType": "bytes32", "name": "s", "type": "bytes32"}],
  "name": "removeLiquidityWithPermit",
  "outputs": [{"internalType": "uint256", "name": "amountA", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountB",
    "type": "uint256"
  }],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountOut", "type": "uint256"}, {
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
  }, {"internalType": "address", "name": "to", "type": "address"}, {
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
  }],
  "name": "swapETHForExactTokens",
  "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
  "stateMutability": "payable",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountOutMin", "type": "uint256"}, {
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
  }, {"internalType": "address", "name": "to", "type": "address"}, {
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
  }],
  "name": "swapExactETHForTokens",
  "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
  "stateMutability": "payable",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountOutMin", "type": "uint256"}, {
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
  }, {"internalType": "address", "name": "to", "type": "address"}, {
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
  }],
  "name": "swapExactETHForTokensSupportingFeeOnTransferTokens",
  "outputs": [],
  "stateMutability": "payable",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountIn", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountOutMin",
    "type": "uint256"
  }, {"internalType": "address[]", "name": "path", "type": "address[]"}, {
    "internalType": "address",
    "name": "to",
    "type": "address"
  }, {"internalType": "uint256", "name": "deadline", "type": "uint256"}],
  "name": "swapExactTokensForETH",
  "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountIn", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountOutMin",
    "type": "uint256"
  }, {"internalType": "address[]", "name": "path", "type": "address[]"}, {
    "internalType": "address",
    "name": "to",
    "type": "address"
  }, {"internalType": "uint256", "name": "deadline", "type": "uint256"}],
  "name": "swapExactTokensForETHSupportingFeeOnTransferTokens",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountIn", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountOutMin",
    "type": "uint256"
  }, {"internalType": "address[]", "name": "path", "type": "address[]"}, {
    "internalType": "address",
    "name": "to",
    "type": "address"
  }, {"internalType": "uint256", "name": "deadline", "type": "uint256"}],
  "name": "swapExactTokensForTokens",
  "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountIn", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountOutMin",
    "type": "uint256"
  }, {"internalType": "address[]", "name": "path", "type": "address[]"}, {
    "internalType": "address",
    "name": "to",
    "type": "address"
  }, {"internalType": "uint256", "name": "deadline", "type": "uint256"}],
  "name": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountOut", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountInMax",
    "type": "uint256"
  }, {"internalType": "address[]", "name": "path", "type": "address[]"}, {
    "internalType": "address",
    "name": "to",
    "type": "address"
  }, {"internalType": "uint256", "name": "deadline", "type": "uint256"}],
  "name": "swapTokensForExactETH",
  "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountOut", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "amountInMax",
    "type": "uint256"
  }, {"internalType": "address[]", "name": "path", "type": "address[]"}, {
    "internalType": "address",
    "name": "to",
    "type": "address"
  }, {"internalType": "uint256", "name": "deadline", "type": "uint256"}],
  "name": "swapTokensForExactTokens",
  "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
  "stateMutability": "nonpayable",
  "type": "function"
}, {"stateMutability": "payable", "type": "receive"}]

class SwapListener {
  private web3: Web3;
  private contract: any;
  private contractAddress: string;

  constructor(rpcUrl: string, contractAddress: string) {
    this.web3 = new Web3(rpcUrl);
    this.contractAddress = contractAddress;
    this.contract = new this.web3.eth.Contract(abi, contractAddress);
  }

  // Method to start listening for swap events
  public startListening() {
    this.contract.events.Swap({
      fromBlock: 'latest' // Listen for new swaps only
    })
      .on('data', this.handleSwapEvent)
      .on('error', console.error);
  }

  // Handler for incoming swap events
  private handleSwapEvent(event: any) {
    // Decode the event data
    const decodedEvent = {
      sender: event.returnValues.sender,
      amountIn: event.returnValues.amountIn,
      amountOut: event.returnValues.amountOut,
      path: event.returnValues.path,
      to: event.returnValues.to,
      deadline: event.returnValues.deadline,
    };

    console.log('Swap Event:', decodedEvent);
  }
}

// Instantiate the class and start listening
const listener = new SwapListener('https://thrilling-greatest-cloud.bsc.quiknode.pro/cfda6f768b37f18e0b107e0d1f458265d7940fa5/', routerAddress);
listener.startListening();
