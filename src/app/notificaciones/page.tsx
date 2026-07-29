import React from "react";
import NotificacionesClient from "./NotificacionesClient";
import { getNotifications } from "@/core/application/actions/notificationActions";

export default async function NotificacionesPage() {
  const result = await getNotifications();
  const notifications = result.data || [];

  return <NotificacionesClient initialNotifications={notifications} />;
}
