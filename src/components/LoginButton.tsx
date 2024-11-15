"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export const SigninButton = () => {
  const { data: session } = useSession();
  if (session) {
    return <button onClick={() => signOut()}>Sign out</button>;
  }
  return (
    <button
      onClick={() => {
        signIn("azure-ad-b2c");
      }}
    >
      Sign in
    </button>
  );
};
