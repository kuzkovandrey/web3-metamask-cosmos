import Button from "@mui/material/Button";
import Link from "next/link";

function HomePage() {
  return (
    <main>
      <Link href="/metamask">
        <Button>Metamask</Button>
      </Link>

      <Link href="/cosmos">
        <Button>Cosmos</Button>
      </Link>
    </main>
  );
}

export default HomePage;
