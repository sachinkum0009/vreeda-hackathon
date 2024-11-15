import { DeviceRequestModel, DeviceResponseModel } from '@/types/vreedaApi';
import { useState } from 'react';

export default function DeviceControl({ id, model }: { id: string, model: DeviceResponseModel }) {
  const [isOn, setIsOn] = useState(model.states?.on?.value);

  async function updateDevice(deviceId: string, request: DeviceRequestModel) {
    try {
      const response = await fetch('/api/vreeda/patch-device', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId, request }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update device');
      }
  
      const data = await response.json();
      console.log('Device updated successfully:', data);
      return data;
    } catch (error) {
      console.log('Error updating device:', error);
      throw error;
    }
  }

  const toggleDevice = async () => {
    try {
      await updateDevice(id, {
        states: { on: !isOn },
      });
      setIsOn(!isOn);
    } catch (error) {
      console.log('Failed to update device state:', error);
    }
  };

  return (
    <li>
        {model.tags?.customDeviceName || 'Unnamed Device'}: {model.connected?.value ? <button onClick={toggleDevice}>{isOn ? 'Turn Off' : 'Turn On'}</button> : "(Offline)"}
    </li>
  );
}