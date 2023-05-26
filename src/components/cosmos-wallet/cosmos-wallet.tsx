import {
  Alert,
  Button,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEventHandler, useState } from "react";
import useCosmosWallet from "./use-cosmos-wallet";

function CosmosWallet() {
  const [mnemonic, setMnemonic] = useState("");
  const { login, logout, wallet, error } = useCosmosWallet();

  const onChange: ChangeEventHandler = ({ target }) => {
    if (target instanceof HTMLInputElement) {
      setMnemonic(target.value);
    }
  };

  const handleSubmit = () => {
    login(mnemonic);
    setMnemonic("");
  };

  return (
    <>
      {wallet ? (
        <Stack p="1rem" gap="1rem">
          <Typography variant="h6">
            Account address: {wallet.address}
          </Typography>

          {!!wallet.balance.length && (
            <>
              <Typography variant="h6">Balance:</Typography>

              {wallet.balance.map((balance, index) => (
                <Typography key={index} variant="body1">
                  {balance.amount} {balance.denom.toUpperCase()}
                </Typography>
              ))}
            </>
          )}

          <Button onClick={logout}>Logout</Button>
        </Stack>
      ) : (
        <Stack p="1rem" gap="1rem">
          <TextField value={mnemonic} onChange={onChange}></TextField>
          <Button onClick={handleSubmit} variant="contained">
            Login
          </Button>
        </Stack>
      )}

      <Snackbar open={!!error} autoHideDuration={6000}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </>
  );
}

export default CosmosWallet;
