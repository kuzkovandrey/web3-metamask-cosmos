// Metamask types
export interface Chain {
  name: string;
  rpc: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  chainId: number;
}

export interface AddEthereumChainParameter {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
}

export interface Wallet {
  account: string;
  accounts: string[];
  balance: {
    wei: string;
    eth: string;
    kuzCoin: string;
  };
  chainId: number;
  chain?: Chain;
}

export interface MetamaskError {
  code: number;
  message: string;
}

export const isMetamaskError = (error: any): error is MetamaskError => {
  return Boolean(error?.code) && Boolean(error?.message);
};

// Cosmos types
export interface CosmosBalance {
  denom: string;
  amount: string;
}

export interface CosmosWallet {
  address: string;
  balance: CosmosBalance[];
}
