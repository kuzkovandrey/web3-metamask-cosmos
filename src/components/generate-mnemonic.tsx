import { Button, Stack, Typography } from "@mui/material";
import { generateMnemonic } from "bip39";
import { useState } from "react";

function GenerateMnemonic() {
  const [mnemonic, setMnemonic] = useState("");

  const generageMnemonic = () => {
    const mnemonic = generateMnemonic(160);
    setMnemonic(mnemonic);
  };

  const onCopyClick = () => {
    navigator.clipboard.writeText(mnemonic);
  };

  return (
    <Stack gap="1rem" p="1rem">
      <Button onClick={generageMnemonic} variant="contained">
        Generate
      </Button>
      <Typography variant="h6">{mnemonic}</Typography>
      <Button onClick={onCopyClick}>Copy</Button>
    </Stack>
  );
}

export default GenerateMnemonic;
