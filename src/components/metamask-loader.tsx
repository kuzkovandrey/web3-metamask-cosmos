import { Box, CircularProgress, Typography, styled } from "@mui/material";

function MetamaskLoader() {
  return (
    <StyledContainer>
      <Box display="flex" alignItems="center" gap="1rem">
        <Typography>Metamask</Typography>
        <CircularProgress />
      </Box>
    </StyledContainer>
  );
}

const StyledContainer = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  backdropFilter: "blur(5px)",
  background: "rgba(255, 255, 255, 0.2)",
  zIndex: 2,
}));

export default MetamaskLoader;
