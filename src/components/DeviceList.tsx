"use client"
import { DevicesResponse } from '@/types/vreedaApi';
import { useEffect, useState } from 'react';
import DeviceControl from './DeviceControl';

export default function DeviceList() {
  const [devices, setDevices] = useState<DevicesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('/api/vreeda/list-devices');
        if (!response.ok) throw new Error('Failed to fetch devices');

        const data: DevicesResponse = await response.json();
        setDevices(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchDevices();
  }, []);

  return (
    <div>
      <h2>Devices</h2>
      {error && <p>Error: {error}</p>}
      <ul>
        {devices &&
            Object.entries(devices).map(([id, device]) => (
                <DeviceControl
                    model={device} id={id} key={id}/>
            ))}
      </ul>
    </div>
  );
}