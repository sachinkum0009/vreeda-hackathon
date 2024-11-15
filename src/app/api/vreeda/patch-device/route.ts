import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';
import { DeviceRequestModel, DevicesResponse } from "@/types/vreedaApi";
import { patchDevice } from '@/lib/vreedaApiClient'; // Replace with your API client path
import { Session } from 'next-auth';

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session: Session | null = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {

    // Parse the incoming request body
    const { deviceId, request }: { deviceId: string; request: DeviceRequestModel } = await req.json();

    //console.log("patching device " + deviceId + " -> " + JSON.stringify(request));

    if (!deviceId || !request) {
      return NextResponse.json({ error: 'Missing deviceId or request body' }, { status: 400 });
    }

    // Call the patchDevice client function
    const updatedDevice: DevicesResponse = await patchDevice(deviceId, request, session.accessToken);

    return NextResponse.json(updatedDevice, { status: 200 });
  } catch (error) {
    console.error('Error patching device:', error);
    return NextResponse.json({ error: 'Failed to patch device' }, { status: 500 });
  }
}
