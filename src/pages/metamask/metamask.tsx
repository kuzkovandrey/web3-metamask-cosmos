import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useMetamaskWallet } from "@/src/providers/metamask-provider";
import MetamaskContextProvider from "@/src/providers/metamask-provider/metamask-context-provider";

function MetamaskPage() {
  return (
    <MetamaskContextProvider>
      <Container maxWidth="md">
        <Wallet></Wallet>
      </Container>
    </MetamaskContextProvider>
  );
}

function Wallet() {
  const { connect, switchChain, chainList, wallet, loading } =
    useMetamaskWallet();

  if (loading) {
    return <CircularProgress />;
  }

  if (!wallet.account) {
    return (
      <Box p="1rem">
        <Button onClick={connect} variant="contained">
          Connect
        </Button>
      </Box>
    );
  }

  return (
    <Stack p="1rem" gap="1rem">
      <Typography variant="body1">Account: {wallet.account}</Typography>

      {wallet.balance && (
        <>
          <Typography variant="body1">
            Ether: <b>{wallet.balance.eth || 0} ETH</b>
          </Typography>

          <Typography variant="body1">
            KuzCoin: <b>{wallet.balance.kuzCoin || 0} KUZ</b>
          </Typography>
        </>
      )}

      {wallet.chainId && (
        <>
          <Typography variant="body1">
            Chain id: <b>{"0x" + wallet.chainId.toString(16)}</b>
          </Typography>
        </>
      )}

      <FormControl>
        <InputLabel id="label">Chain</InputLabel>
        <Select
          labelId="label"
          value={wallet.chainId}
          label="Chain"
          onChange={(value) => {
            switchChain(+value.target.value);
          }}
        >
          {chainList.map((chain) => (
            <MenuItem key={chain.chainId} value={chain.chainId}>
              {chain.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}

export default MetamaskPage;
