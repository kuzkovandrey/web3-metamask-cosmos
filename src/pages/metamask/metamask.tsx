import { Container } from "@mui/material";
import { MetamaskContextProvider } from "@/src/providers/metamask-provider";
import { MetamaskWallet } from "@/src/components";

function MetamaskPage() {
  return (
    <MetamaskContextProvider>
      <Container maxWidth="md">
        <MetamaskWallet />
      </Container>
    </MetamaskContextProvider>
  );
}

export default MetamaskPage;
