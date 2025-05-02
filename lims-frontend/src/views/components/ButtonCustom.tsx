import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface ButtonCustomProps {
  url: string;
  children: ReactNode;
}

export default function ButtonCustom({ url, children }: ButtonCustomProps) {
  const router = useRouter();

  return (
    <Button
      variant="contained"
      startIcon={<i className="tabler-plus" />}
      onClick={() => router.push(url)}
      className="max-sm:is-full"
    >
      {children}
    </Button>
  );
}
