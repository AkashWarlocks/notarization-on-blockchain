let binanceCustomChain = {
  name: 'Binance Smart Chain Testnet',
  networkId: 97,
  chainId: 97,
  url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  hardforks: [
    {
      name: 'istanbul',
      block: 1561651,
      forkHash: '0xc25efa5c',
    },
  ],
  genesis: {
    timestamp: '0x5c51a607',
    gasLimit: 10485760,
    difficulty: 1,
    nonce: '0x0000000000000000',
    extraData:
      '0x22466c6578692069732061207468696e6722202d204166726900000000000000e0a2bd4258d2768837baa26a28fe71dc079f84c70000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  },
  bootstrapNodes: [],
};
