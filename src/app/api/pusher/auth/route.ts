import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPusherServer } from "@/lib/pusherServer";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const pusher = getPusherServer();
    if (!pusher) {
      return NextResponse.json({ error: "Pusher no configurado" }, { status: 500 });
    }

    let socketId = "";
    let channelName = "";

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      socketId = (formData.get("socket_id") as string) || "";
      channelName = (formData.get("channel_name") as string) || "";
    } else {
      const body = await request.json().catch(() => ({}));
      socketId = body.socket_id || "";
      channelName = body.channel_name || "";
    }

    if (!socketId || !channelName) {
      return NextResponse.json({ error: "Parámetros incompletos" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const presenceData = {
      user_id: userId,
      user_info: {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
    };

    const authResponse = pusher.authorizeChannel(socketId, channelName, presenceData);
    return NextResponse.json(authResponse);
  } catch (error: any) {
    console.error("Error in Pusher auth:", error);
    return NextResponse.json({ error: error.message || "Error de autorización" }, { status: 500 });
  }
}
