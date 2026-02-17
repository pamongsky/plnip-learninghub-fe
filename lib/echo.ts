import Echo from "laravel-echo";
import Pusher from "pusher-js";
import api from "./axios";

// Type definitions for Echo/Pusher
interface BroadcastChannel {
  name: string;
}

interface BroadcastAuthResponse {
  auth?: string;
  channel_data?: string;
  shared_secret?: string;
}

type BroadcastCallback = (error: Error | null, data: BroadcastAuthResponse | null) => void;

// Make Pusher available globally for Laravel Echo
if (typeof window !== "undefined") {
  (window as typeof window & { Pusher: typeof Pusher }).Pusher = Pusher;
}

let echoInstance: Echo<Pusher> | null = null;

export function getEcho(): Echo<Pusher> | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
      wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT ?? "443"),
      wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT ?? "443"),
      forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "wss") === "wss",
      enabledTransports: ["ws", "wss"],
      authEndpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Accept: "application/json",
        },
      },
      // Use axios for authorization (includes Sanctum token)
      authorizer: (channel: BroadcastChannel) => {
        return {
          authorize: (
            socketId: string,
            callback: BroadcastCallback,
          ) => {
            api
              .post("/broadcasting/auth", {
                socket_id: socketId,
                channel_name: channel.name,
              })
              .then((response) => {
                callback(null, response.data);
              })
              .catch((error) => {
                // Only log non-403 errors (403 can happen on reconnect/retry)
                if (error.response?.status !== 403) {
                  // Broadcasting auth error - silent fail
                }
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
