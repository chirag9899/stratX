type Icon = {
  url: string;
  width: number;
  height: number;
  format: string;
};

type ChainExplorer = {
  name: string;
  url: string;
  icon?: Icon;
  standard: string;
};
type Chain = {
  name: string;
  title?: string;
  chain: string;
  icon?: Icon;
  rpc: readonly string[];
  features?: Readonly<Array<{ name: string }>>;
  faucets?: readonly string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  infoURL?: string;
  shortName: string;
  chainId: number;
  networkId?: number;
  ens?: {
    registry: string;
  };
  explorers?: Readonly<Array<ChainExplorer>>;
  testnet: boolean;
  slug: string;
  slip44?: number;
  status?: string;
  redFlags?: readonly string[];
  parent?: {
    chain: string;
    type: string;
    bridges?: Readonly<Array<{ url: string }>>;
  };
};

export default {
  chain: "FRAX",
  chainId: 9018,
  explorers: [
    {
      name: "fraxscan",
      url: "https://fraxscan.com",
      standard: "EIP3091",
    },
  ],
  faucets: [],
  features: [],
  icon: {
    url: "ipfs://QmQLJk5G7zF8ZDxSxkRcpHqEqcifrJEhGmEKC6zwyPXWAw/fraxchain.png",
    width: 512,
    height: 512,
    format: "PNG",
  },
  infoURL: "https://mainnet.frax.com",
  name: "Fraxtal",
  nativeCurrency: {
    name: "Frax Ether",
    symbol: "frxETH",
    decimals: 18,
  },
  networkId: 252,
  redFlags: [],
  rpc: [
    "https://virtual.fraxtal.rpc.tenderly.co/7c8a4a67-11d3-4223-82cf-2a6c2cf0e1c7",
  ],
  shortName: "fraxtal",
  slug: "fraxtal",
  status: "active",
  testnet: false,
} as const satisfies Chain;
