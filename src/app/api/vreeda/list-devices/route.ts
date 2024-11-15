import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { listDevices } from '@/lib/vreedaApiClient'; // Replace with your actual utility import
import { authOptions } from '../../auth/[...nextauth]/route';
  
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const devices = await listDevices(session.accessToken);
    return NextResponse.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}