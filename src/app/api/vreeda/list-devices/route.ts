import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { listDevices } from '@/lib/vreedaApiClient'; // Replace with your actual utility import
import { authOptions } from '../../auth/[...nextauth]/route';
import { Session } from 'next-auth';
import UserContext from "@/models/UserContext";
  
export async function GET() {
  const session: Session | null = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id; // Extract user ID
  if (!userId) {
    return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
  }

  try {
    const userContext = await UserContext.findOne({ userId });
    if (!userContext) {
      return NextResponse.json({ granted: false, message: "User context not found" }, { status: 404 });
    }

    const { apiAccessTokens } = userContext;
    if (!apiAccessTokens?.accessToken || !apiAccessTokens?.refreshToken) {
      return NextResponse.json({ granted: false, message: "Tokens are missing" }, { status: 401 });
    }

    const devices = await listDevices(apiAccessTokens?.accessToken);
    return NextResponse.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}