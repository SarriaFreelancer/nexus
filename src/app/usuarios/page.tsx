import React from "react";
import UsuariosClient from "./UsuariosClient";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { redirect } from "next/navigation";

export default async function UsuariosPage() {
  const { member } = await getCurrentWorkspace();
  if (member.role !== "ADMIN") {
    redirect("/");
  }

  return <UsuariosClient />;
}
