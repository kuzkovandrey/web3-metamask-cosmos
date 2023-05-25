import { Chain } from "../types";
import { CHAIN_LIST_API_URL, INFURA_API_KEY } from "../values";

export async function getChainList(): Promise<Chain[]> {
  const LIMIT = 50;

  try {
    return await fetch(CHAIN_LIST_API_URL)
      .then((res) => res.json())
      .then((res: Chain[]) => res.slice(0, LIMIT))
      .then(mapChainList);
  } catch {
    return [];
  }
}

const mapRpcList = (list: string[]): string[] => {
  const REPLACE_KEY = "${INFURA_API_KEY}";

  if (!INFURA_API_KEY) {
    return list.filter((rpc) => !rpc.includes(REPLACE_KEY));
  }

  return list.map((rpc) =>
    rpc.includes(REPLACE_KEY) ? rpc.replace(REPLACE_KEY, INFURA_API_KEY) : rpc
  );
};

const mapChainList = (chainList: Chain[]): Chain[] => {
  return chainList.map((chain) => ({
    ...chain,
    rpc: mapRpcList(chain.rpc),
  }));
};
