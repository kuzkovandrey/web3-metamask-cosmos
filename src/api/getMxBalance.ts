import Web3 from "web3";
import { CosmosBalance } from "../types";

export async function getMxBalance(address: string): Promise<CosmosBalance[]> {
  const balances = await fetch(`/api/balance?address=${address}`)
    .then((res) => res.json())
    .then(formatBalanceList);

  return balances;
}

function formatBalanceList(balanceList: CosmosBalance[]): CosmosBalance[] {
  return balanceList.map(({ amount, denom }) => ({
    denom,
    amount: Web3.utils.fromWei(amount, "ether"),
  }));
}
