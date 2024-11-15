"use client"
import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { SigninButton as SigninButton } from '@/components/LoginButton';
import DeviceList from '@/components/DeviceList'; // Importieren Sie die DeviceList-Komponente
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession(); // Session-Status abrufen

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1>This is a VREEDA-Sample-Service</h1>
        {status === 'loading' ? (
          <p>Loading...</p> // Wenn der Login-Status noch geprüft wird
        ) : session ? (
          // Geräteliste anzeigen, wenn der Benutzer eingeloggt ist
          <>
            <p>Welcome, {session.user?.name || 'User'}!</p>
            <DeviceList /> 
            <br/>
            <SigninButton />
          </>
        ) : (
          // Login-Button anzeigen, wenn der Benutzer nicht eingeloggt ist
          <>
            <p>Please sign in to view your devices.</p>
            <SigninButton />
          </>
        )}
      </Box>
    </Container>
  );
}
