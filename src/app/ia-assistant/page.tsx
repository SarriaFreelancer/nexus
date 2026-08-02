import React from "react";
import {
  getProjectsForAudit,
  getConfiguredAiProvider,
  getLatestAudit,
  getAuditHistory,
} from "@/core/application/actions/aiAuditActions";
import IAAssistantClient from "./IAAssistantClient";

export const dynamic = "force-dynamic";

export default async function IAAssistantPage() {
  const [projectsResult, providerInfo] = await Promise.all([
    getProjectsForAudit(),
    getConfiguredAiProvider(),
  ]);

  const projects = projectsResult.data || [];
  const firstProjectId = projects[0]?.id;

  // Load latest audit and history for the first project
  let latestAudit = null;
  let auditHistory: any[] = [];

  if (firstProjectId) {
    const [latestResult, historyResult] = await Promise.all([
      getLatestAudit(firstProjectId),
      getAuditHistory(firstProjectId),
    ]);

    latestAudit = latestResult.data || null;
    auditHistory = historyResult.data || [];
  }

  return (
    <IAAssistantClient
      projects={projects}
      providerInfo={providerInfo}
      latestAudit={latestAudit}
      auditHistory={auditHistory}
    />
  );
}
