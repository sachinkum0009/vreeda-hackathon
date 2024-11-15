"use client";
import { Button } from "@mui/material";
import { useSession, signIn, signOut } from "next-auth/react";

export const SigninButton = () => {
  const { data: session } = useSession();
  return session ? (
    <Button variant="contained" color="secondary" onClick={() => signOut()}>
      Sign Out
    </Button>
  ) : (
    <Button variant="contained" color="primary" onClick={() => signIn('azure-ad-b2c')}>
      Sign In
    </Button>
  );
};
