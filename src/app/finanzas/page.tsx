import React from "react";
import { getFinancials } from "@/core/application/actions/financialActions";
import { FinanzasClient } from "./FinanzasClient";
import { getCurrentWorkspace } from "@/lib/serverAuth";
import { redirect } from "next/navigation";

export default async function FinanzasPage() {
  const { member } = await getCurrentWorkspace();
  if (member.role !== "ADMIN" && member.role !== "COMMERCIAL") {
    redirect("/");
  }

  const result = await getFinancials();
  const financialRecords = result.data || [];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <FinanzasClient records={financialRecords} />
    </div>
  );
}
