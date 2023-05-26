import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { useState } from "react";
import { CosmosWallet } from "@/src/types";
import { getMxBalance } from "@/src/api";

const useCosmosWallet = () => {
  const [wallet, setWallet] = useState<CosmosWallet | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const walletFromMnemonic = async (mnemonic: string) => {
    return DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "mx",
    });
  };

  const generateWallet = async () => {
    return DirectSecp256k1HdWallet.generate(15, { prefix: "mx" });
  };

  const login = async (mnemonic: string | undefined) => {
    try {
      setLoading(true);
      setError("");

      const wallet = mnemonic
        ? await walletFromMnemonic(mnemonic)
        : await generateWallet();

      const [account] = await wallet.getAccounts();

      const balance = await getMxBalance(account.address);

      setWallet({ address: account.address, balance });
    } catch (e) {
      setError("Incorrect mnemonic");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setWallet(null);
  };

  return {
    login,
    logout,
    wallet,
    error,
    loading,
  };
};

export default useCosmosWallet;
