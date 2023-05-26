import { CosmosWallet, GenerateMnemonic } from "@/src/components";
import { Container } from "@mui/material";

function CosmosPage() {
  return (
    <Container maxWidth="sm">
      <GenerateMnemonic />
      <CosmosWallet />
    </Container>
  );
}

export default CosmosPage;
