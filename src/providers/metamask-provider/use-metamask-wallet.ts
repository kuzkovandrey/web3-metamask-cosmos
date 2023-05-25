import { useContext } from "react";
import { MetamaskContext } from "./metamask-context-provider";

function useMetamaskWallet() {
  const context = useContext(MetamaskContext);

  if (!context) {
    throw new Error(
      "useWeb3Metamask must be used within a MetamaskContextProvider"
    );
  }

  return context;
}

export default useMetamaskWallet;
