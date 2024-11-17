"use client"
import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import DeviceList from '@/components/DeviceList'; // Importieren Sie die DeviceList-Komponente
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export default function Home() {
  const { data: session, status } = useSession(); // Session-Status abrufen
  const [grantStatus, setGrantStatus] = useState<"active" | "needs renewal" | null>(null);
  const [loadingGrant, setLoadingGrant] = useState(false);

  // Check grant status on mount
  useEffect(() => {
    if (session) {
      checkGrantStatus();
    }
  }, [session]);

  const checkGrantStatus = async () => {
    setLoadingGrant(true);
    try {
      const response = await fetch(`/api/user/granted`);
      if (!response.ok) {
        throw new Error("Failed to check grant status");
      }
      const data = await response.json();
      setGrantStatus(data.granted ? "active" : "needs renewal");
    } catch (error) {
      console.error("Error checking grant status:", error);
      setGrantStatus("needs renewal");
    } finally {
      setLoadingGrant(false);
    }
  };

  const revokeGrant = async () => {
    if (!session?.user?.email) return;
    try {
      const response = await fetch(`/api/user/revoke`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to revoke grant");
      }
      signOut(); // Log out after revoking the grant
    } catch (error) {
      console.error("Error revoking grant:", error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom>
          VREEDA Hackathon
        </Typography>
        {status === 'loading' ? (
          <Typography variant="body1">Loading...</Typography>
        ) : session ? (
          <>
            <Box
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                display: "flex",
                gap: 2,
              }}
            >
              {/* Logout Button */}
              <Button variant="outlined" color="primary" onClick={() => signOut()}>
                Logout
              </Button>
              {/* Revoke Button */}
              <Button variant="contained" color="error" onClick={revokeGrant}>
                Revoke
              </Button>
            </Box>

            <Typography variant="body1">
              TEAM SAPS 
               {/* {session.user?.name || "User"}! */}
            </Typography>

            {/* Display Grant Status */}
            <Box mt={2}>
              <Typography variant="body2">
                Grant Status:{" "}
                {loadingGrant ? "Checking..." : grantStatus === "active" ? "Active" : "Needs Renewal"}
              </Typography>
            </Box>

            <DeviceList />
          </>
        ) : (
          <>
            <Typography variant="body1" gutterBottom>
              Please sign in to activate service.
            </Typography>
                          {/* SignIn Button */}
            <Button variant="outlined" color="primary" onClick={() => signIn('azure-ad-b2c')}>
              Sign In
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}
