import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useWeb3Metamask } from "../web3-provider";
import { Wallet, isMetamaskError } from "@/src/types";
import {
  CHAIN_LIST,
  KUZ_COIN_ABI,
  KUZ_COIN_CONTRACT_ADDRESS,
} from "@/src/values";
import { useNotifications } from "../notifications-provider";
import { MetamaskLoader } from "@/src/components";

type WalletContextValue = {
  addChain: (chainId: number) => void;
  switchChain: (chainId: number) => void;
  connect: () => void;
  wallet: Wallet;
  isConnected: boolean;
};

const WalletContext = createContext<WalletContextValue>(
  {} as WalletContextValue
);

export default function WalletProvider({ children }: PropsWithChildren) {
  const { web3 } = useWeb3Metamask();
  const { showMessage } = useNotifications();

  const [wallet, setWallet] = useState<Wallet>({} as Wallet);
  const [loading, setLoading] = useState(false);

  const addChain = useCallback(
    async (chainId: number) => {
      try {
        setLoading(true);

        const chain = CHAIN_LIST.find(({ chainId: id }) => id === chainId);

        if (chain) {
          const params = [
            {
              chainId: web3.utils.toHex(chain.chainId),
              chainName: chain.name,
              rpcUrls: chain.rpc,
              nativeCurrency: chain.nativeCurrency,
            },
          ];

          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params,
          });
        }
      } catch (e) {
        if (isMetamaskError(e)) {
          showMessage({ type: "error", text: `${e.code} : ${e.message}` });

          return;
        }

        showMessage({
          type: "error",
          text: "Unknown error from WalletProvider",
        });
      } finally {
        setLoading(false);
      }
    },
    [web3, showMessage]
  );

  const switchChain = useCallback(
    async (chainId: number) => {
      setLoading(true);

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: web3.utils.toHex(chainId) }],
        });
      } catch (e) {
        if (isMetamaskError(e) && e.code === 4902) {
          await addChain(chainId);

          return;
        }

        if (isMetamaskError(e)) {
          showMessage({
            type: "error",
            text: `${e.code}: ${e.message}`,
          });

          return;
        }

        showMessage({
          type: "error",
          text: "Unknown error from WalletProvider",
        });
      } finally {
        setLoading(false);
      }
    },
    [web3, addChain, showMessage]
  );

  const getKuzCoinBalance = useCallback(
    async (accountAddress: string): Promise<string> => {
      const contract = new web3.eth.Contract(
        KUZ_COIN_ABI,
        KUZ_COIN_CONTRACT_ADDRESS
      );

      const request = contract.methods
        .balanceOf(accountAddress)
        .call() as Promise<string>;

      try {
        return await request;
      } catch (e) {
        return "0";
      }
    },
    [web3]
  );

  const getAccountBalance = useCallback(
    async (account: string): Promise<Wallet["balance"]> => {
      const balance = await web3.eth.getBalance(account);
      const eth = web3.utils.fromWei(balance, "ether");

      const kuzCoin = await getKuzCoinBalance(account).then((coin) =>
        web3.utils.fromWei(coin, "ether")
      );

      return {
        eth,
        wei: balance,
        kuzCoin,
      };
    },
    [web3, getKuzCoinBalance]
  );

  const handleAccountsChanged = useCallback(
    async (accounts: Array<string>) => {
      if (!accounts.length) {
        setWallet({} as Wallet);
        setLoading(false);

        return;
      }

      setLoading(true);

      const [account] = accounts;
      const balance = await getAccountBalance(account);
      const chainId = await web3.eth.getChainId();
      const chain = CHAIN_LIST.find(({ chainId: id }) => id === chainId);

      setWallet({ account, balance, chainId, accounts, chain });
      setLoading(false);
    },
    [setWallet, setLoading, getAccountBalance, web3]
  );

  const connect = useCallback(async () => {
    setLoading(true);

    const requestAccounts = await web3.eth.requestAccounts();

    handleAccountsChanged(requestAccounts);
  }, [setLoading, handleAccountsChanged, web3]);

  useEffect(() => {
    window.ethereum.on("chainChanged", connect);

    return () => {
      window.ethereum?.removeListener("chainChanged", connect);
    };
  }, [connect]);

  useEffect(() => {
    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [handleAccountsChanged]);

  if (loading) {
    return <MetamaskLoader />;
  }

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isConnected: Boolean(wallet.accounts?.length),
        switchChain,
        addChain,
        connect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }

  return context;
}
