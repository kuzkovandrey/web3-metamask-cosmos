import { GasPrice, StargateClient } from "@cosmjs/stargate";
import { NextApiRequest, NextApiResponse } from "next";

const RPC_URL = "http://128.140.84.101:26657";

const CLIENT_OPTIONS = {
  gasPrice: GasPrice.fromString("10000000000000mpx"),
  broadcastTimeoutMs: 5000,
  broadcastPollIntervalMs: 1000,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //@ts-ignore
  const client = await StargateClient.connect(RPC_URL, CLIENT_OPTIONS);
  const address = req.query.address;

  if (req.method !== "GET" || Array.isArray(address) || !address) {
    res.status(400);

    return;
  }

  try {
    const balances = await client.getAllBalances(address);
    res.json(balances);
  } catch {
    res.json([]);
  }
}
