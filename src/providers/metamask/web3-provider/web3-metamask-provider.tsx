import { MetamaskLoader } from "@/src/components";
import detectEthereumProvider from "@metamask/detect-provider";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import Web3 from "web3";

type Web3MetamaskContextValue = {
  web3: Web3;
};

const Web3MetamaskContext = createContext<Web3MetamaskContextValue>(
  {} as Web3MetamaskContextValue
);

export default function Web3MetamaskProvider({ children }: PropsWithChildren) {
  const [initialization, setInitialization] = useState(true);
  const [web3Instance, setWeb3Instance] = useState<Web3>({} as Web3);

  const init = async () => {
    const web3 = await getWeb3Instance();

    if (web3) {
      setWeb3Instance(web3);
    }

    setInitialization(false);
  };

  useEffect(() => {
    init();
  }, []);

  if (initialization) {
    return <MetamaskLoader />;
  }

  if (web3Instance instanceof Web3) {
    return (
      <Web3MetamaskContext.Provider value={{ web3: web3Instance }}>
        {children}
      </Web3MetamaskContext.Provider>
    );
  }

  return <div>Metamask not supported...</div>;
}

export function useWeb3Metamask() {
  const context = useContext(Web3MetamaskContext);

  if (!context) {
    throw new Error(
      "useWeb3Metamask must be used within a Web3MetamaskProvider"
    );
  }

  return context;
}

async function getWeb3Instance() {
  const provider = await detectEthereumProvider({ silent: true });

  if (provider !== window.ethereum || provider === null) {
    return null;
  }

  return new Web3(Web3.givenProvider);
}
