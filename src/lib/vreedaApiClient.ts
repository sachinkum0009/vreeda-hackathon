import { DeviceRequestModel, DevicesRequest, DevicesResponse } from "@/types/vreedaApi";

export interface FetchOptions<REQ> {
    method?: 'GET' | 'PATCH';
    body?: REQ; // Optional: für POST/PUT Anfragen
    headers?: Record<string, string>; // Zusätzliche Header
  }
  
export async function apiFetch<REQ, RES>(path: string, token: string, options?: FetchOptions<REQ>): Promise<RES> {
    const defaultHeaders: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const url = process.env.VREEDA_API_BASEURL + path;

    console.log("fetching " + url);

    const response = await fetch(url, {
        method: options?.method || 'GET',
        headers: {
        ...defaultHeaders,
        ...options?.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("received " + JSON.stringify(result));

    return result;
}

export async function listDevices(token: string): Promise<DevicesResponse> {
    return await apiFetch<null, DevicesResponse>('/1.0/Device', token, {
      method: 'GET',
    });
}

export async function patchDevice(deviceId: string, request: DeviceRequestModel, token: string): Promise<DevicesResponse> {
    return await apiFetch<DevicesRequest, DevicesResponse>('/1.0/Device/' + deviceId, token, {
      method: 'PATCH',
      body: { 
        [deviceId]: request
      }
    });
}