import React from "react";
import { getDocuments } from "@/core/application/actions/documentActions";
import { getProjects } from "@/core/application/actions/projectActions";
import { DocumentClient } from "./DocumentClient";

export const dynamic = "force-dynamic";

export default async function DocumentacionPage() {
  const result = await getDocuments();
  const docsList = result.data || [];
  
  const projectsResult = await getProjects();
  const projects = projectsResult.data || [];

  return (
    <div className="max-w-[1600px] mx-auto pb-10">
      <DocumentClient initialDocs={docsList} projects={projects} />
    </div>
  );
}
