import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Laravel Echo
if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

let echoInstance: Echo<any> | null = null;

export function getEcho(): Echo<any> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
      wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
      wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
      forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http') === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/broadcasting/auth`,
      auth: {
        headers: {
          Accept: 'application/json',
        },
      },
      // Include credentials for auth
      authorizer: (channel: any, options: any) => {
        return {
          authorize: (socketId: string, callback: (error: any, data: any) => void) => {
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/broadcasting/auth`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                socket_id: socketId,
                channel_name: channel.name,
              }),
            })
              .then((response) => response.json())
              .then((data) => {
                callback(null, data);
              })
              .catch((error) => {
                callback(error, null);
              });
          },
        };
      },
    });
  }

  return echoInstance;
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
