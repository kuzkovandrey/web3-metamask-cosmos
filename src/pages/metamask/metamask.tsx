import { Container } from "@mui/material";
import { MetamaskWallet } from "@/src/components";
import {
  WalletProvider,
  Web3MetamaskProvider,
  NotificationsProvider,
} from "@/src/providers/metamask";

function MetamaskPage() {
  return (
    <NotificationsProvider>
      <Web3MetamaskProvider>
        <WalletProvider>
          <Container maxWidth="md">
            <MetamaskWallet />
          </Container>
        </WalletProvider>
      </Web3MetamaskProvider>
    </NotificationsProvider>
  );
}

export default MetamaskPage;
