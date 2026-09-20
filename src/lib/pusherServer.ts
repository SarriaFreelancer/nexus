import Pusher from "pusher";

let pusherInstance: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  if (pusherInstance) return pusherInstance;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1";

  if (!appId || !key || !secret) {
    // Return null if Pusher credentials are not configured yet
    return null;
  }

  try {
    pusherInstance = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
    return pusherInstance;
  } catch (error) {
    console.error("Error initializing Pusher server instance:", error);
    return null;
  }
}

export async function triggerPusherEvent(channel: string, event: string, data: any): Promise<boolean> {
  try {
    const pusher = getPusherServer();
    if (!pusher) {
      // Pusher is not configured, silently skip or return false
      return false;
    }
    await pusher.trigger(channel, event, data);
    return true;
  } catch (error) {
    console.error(`Error triggering Pusher event "${event}" on channel "${channel}":`, error);
    return false;
  }
}
