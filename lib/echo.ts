import Echo from "laravel-echo";
import Pusher from "pusher-js";
import api from "./axios";

// Make Pusher available globally for Laravel Echo
if (typeof window !== "undefined") {
  (window as any).Pusher = Pusher;
}

let echoInstance: Echo<any> | null = null;

export function getEcho(): Echo<any> | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
      wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080"),
      wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080"),
      forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || "http") === "https",
      enabledTransports: ["ws", "wss"],
      authEndpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/broadcasting/auth`,
      auth: {
        headers: {
          Accept: "application/json",
        },
      },
      // Use axios for authorization (includes Sanctum token)
      authorizer: (channel: any) => {
        return {
          authorize: (
            socketId: string,
            callback: (error: any, data: any) => void,
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
                  console.error("Broadcasting auth error:", error);
                }
                callback(error, null);
              });
          },
        };
      },
    });

    console.log("Echo instance created with Reverb broadcaster");
  }

  return echoInstance;
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
