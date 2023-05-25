import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import { getChainList } from "@/src/api";
import { Alert, Snackbar } from "@mui/material";
import { Chain, Wallet, isMetamaskError } from "@/src/types";
import { KUZ_COIN_ABI, KUZ_COIN_CONTRACT_ADDREESS } from "@/src/values";

type ContextValue = {
  wallet: Wallet;
  connect: () => void;
  switchChain: (chainId: number) => void;
  loading: boolean;
  chainList: Chain[];
};

export const MetamaskContext = createContext<ContextValue>({} as ContextValue);

export default function MetamaskContextProvider({
  children,
}: PropsWithChildren) {
  const web3InstanceRef = useRef<Web3>({} as Web3);

  const [initializaton, setInitializaton] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [wallet, setWallet] = useState<Wallet>({} as Wallet);
  const [chainList, setChainList] = useState<Chain[]>([]);

  const init = async () => {
    const web3 = await getWeb3Instance();

    if (web3) {
      web3InstanceRef.current = web3;

      const chainList = await getChainList();

      console.log(chainList);

      setChainList(chainList);
    }

    setInitializaton(false);
  };

  const getKuzCoinBalance = useCallback(async (accountAddress: string) => {
    const contract = new web3InstanceRef.current.eth.Contract(
      KUZ_COIN_ABI,
      KUZ_COIN_CONTRACT_ADDREESS
    );

    const request = contract.methods
      .balanceOf(accountAddress)
      .call() as Promise<string>;

    try {
      return await request;
    } catch (e) {
      return "0";
    }
  }, []);

  const getAccountBalance = useCallback(
    async (account: string): Promise<Wallet["balance"]> => {
      const balance = await web3InstanceRef.current.eth.getBalance(account);
      const eth = web3InstanceRef.current.utils.fromWei(balance, "ether");

      const kuzCoin = await getKuzCoinBalance(account).then((coin) =>
        web3InstanceRef.current.utils.fromWei(coin, "ether")
      );

      return {
        eth,
        wei: balance,
        kuzCoin,
      };
    },
    [web3InstanceRef, getKuzCoinBalance]
  );

  const handleAccountsChanged = useCallback(
    async (accounts: Array<string>) => {
      setLoading(true);

      const [account] = accounts;
      const balance = await getAccountBalance(account);
      const chainId = await web3InstanceRef.current.eth.getChainId();
      const chain = chainList.find(({ chainId: id }) => id === chainId);

      setWallet({ account, balance, chainId, accounts, chain });
      setLoading(false);
    },
    [setWallet, setLoading, getAccountBalance, web3InstanceRef, chainList]
  );

  const connect = useCallback(async () => {
    setLoading(true);

    const accounts = await web3InstanceRef.current.eth.getAccounts();

    if (accounts.length) {
      handleAccountsChanged(accounts);

      return;
    }

    const requestAccounts = await web3InstanceRef.current.eth.requestAccounts();

    handleAccountsChanged(requestAccounts);
  }, [setLoading, handleAccountsChanged]);

  const switchChain = async (chainId: number) => {
    setLoading(true);

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: web3InstanceRef.current.utils.toHex(chainId) }],
      });

      setLoading(false);
    } catch (e) {
      if (!isMetamaskError(e)) {
        console.error(e);

        return;
      }

      if (e.code === 4902) {
        await addChain(chainId);
      } else {
        setError(e.message);
        setLoading(false);
      }
    }
  };

  const addChain = async (chainId: number) => {
    setLoading(true);

    try {
      const chain = chainList.find(({ chainId: id }) => id === chainId);

      if (chain) {
        const params = [
          {
            chainId: web3InstanceRef.current.utils.toHex(chain.chainId),
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
        setError(`${e.code} : ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [handleAccountsChanged]);

  useEffect(() => {
    window.ethereum.on("chainChanged", connect);

    return () => {
      window.ethereum?.removeListener("chainChanged", connect);
    };
  }, [connect]);

  if (initializaton) {
    return <div>Initializaton...</div>;
  }

  if (!(web3InstanceRef.current instanceof Web3)) {
    return <div>Metamask not supported</div>;
  }

  return (
    <MetamaskContext.Provider
      value={{
        wallet,
        connect,
        switchChain,
        loading,
        chainList,
      }}
    >
      <>
        {children}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
        >
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      </>
    </MetamaskContext.Provider>
  );
}

async function getWeb3Instance() {
  const provider = await detectEthereumProvider({ silent: true });

  if (provider !== window.ethereum || provider === null) {
    return null;
  }

  return new Web3(Web3.givenProvider);
}
