import React from "react";
import ConfiguracionClient from "./ConfiguracionClient";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { redirect } from "next/navigation";

export default async function ConfiguracionPage() {
  const { member } = await getCurrentWorkspace();
  if (member.role !== "ADMIN" && member.role !== "MANAGER") {
    redirect("/");
  }

  return <ConfiguracionClient />;
}
