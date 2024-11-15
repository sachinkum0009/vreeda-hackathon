"use client"
import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { SigninButton as SigninButton } from '@/components/LoginButton';
import DeviceList from '@/components/DeviceList'; // Importieren Sie die DeviceList-Komponente
import { useSession } from 'next-auth/react';
import { Typography } from '@mui/material';

export default function Home() {
  const { data: session, status } = useSession(); // Session-Status abrufen

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
          VREEDA Sample Service
        </Typography>
        {status === 'loading' ? (
          <Typography variant="body1">Loading...</Typography>
        ) : session ? (
          <>
            <Typography variant="body1">
              Welcome, {session.user?.name || 'User'}!
            </Typography>
            <DeviceList />
            <Box mt={2}>
              <SigninButton />
            </Box>
          </>
        ) : (
          <>
            <Typography variant="body1" gutterBottom>
              Please sign in to view your devices.
            </Typography>
            <SigninButton />
          </>
        )}
      </Box>
    </Container>
  );
}
