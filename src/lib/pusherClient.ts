import PusherClient from "pusher-js";

let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient | null {
  if (typeof window === "undefined") return null;
  if (pusherClientInstance) return pusherClientInstance;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1";

  if (!key) {
    return null;
  }

  try {
    pusherClientInstance = new PusherClient(key, {
      cluster,
      authEndpoint: "/api/pusher/auth",
    });
    return pusherClientInstance;
  } catch (error) {
    console.warn("Could not initialize Pusher client:", error);
    return null;
  }
}

/**
 * Registra el Service Worker de Pusher Beams y configura las notificaciones Push web
 */
export async function initPusherBeams(userId?: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;

  const instanceId = process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID;
  if (!instanceId) {
    // Si no está configurado el instanceId de Beams, registramos el service worker básico
    try {
      await navigator.serviceWorker.register("/service-worker.js");
      return true;
    } catch (e) {
      console.warn("Service worker registration skipped:", e);
      return false;
    }
  }

  try {
    const { Client } = await import("@pusher/push-notifications-web");
    const beamsClient = new Client({
      instanceId,
      serviceWorkerRegistration: await navigator.serviceWorker.register("/service-worker.js"),
    });

    await beamsClient.start();

    if (userId) {
      await beamsClient.addDeviceInterest(`user-${userId}`);
      await beamsClient.addDeviceInterest("global-notifications");
    }

    return true;
  } catch (error) {
    console.warn("Pusher Beams initialization skipped or error:", error);
    return false;
  }
}
