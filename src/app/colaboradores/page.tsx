import React from "react";
import ColaboradoresClient from "./ColaboradoresClient";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { redirect } from "next/navigation";

export default async function ColaboradoresPage() {
  const { member } = await getCurrentWorkspace();
  if (member.role !== "ADMIN" && member.role !== "MANAGER" && (member as any).user?.globalRole !== "SUPER_ADMIN") {
    redirect("/");
  }

  return <ColaboradoresClient />;
}
