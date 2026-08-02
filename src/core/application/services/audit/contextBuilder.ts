import { prisma } from "@/lib/prisma";
import { AuditContext } from "@/core/domain/aiAuditTypes";
import { collectDatabaseContext } from "./dbCollector";
import { collectGitContext } from "./gitCollector";
import { analyzeProjectFiles } from "./fileAnalyzer";

export async function buildAuditContext(projectId: string, workspaceId: string): Promise<AuditContext> {
  const dbContext = await collectDatabaseContext(projectId, workspaceId);

  const project = await prisma.project.findUnique({
    where: { id: projectId, workspaceId },
    select: { gitRepoUrl: true, gitToken: true }
  });

  let gitContext = null;
  let filesContext = null;

  if (project?.gitRepoUrl) {
    gitContext = await collectGitContext(project.gitRepoUrl, project.gitToken);

    if (gitContext) {
      filesContext = await analyzeProjectFiles(
        project.gitRepoUrl,
        project.gitToken,
        gitContext.defaultBranch,
        gitContext.repoStructure
      );
    }
  }

  return {
    project: dbContext.project!,
    tasks: dbContext.tasks!,
    versions: dbContext.versions!,
    team: dbContext.team!,
    documentation: dbContext.documentation!,
    servers: dbContext.servers!,
    financials: dbContext.financials!,
    previousAudits: dbContext.previousAudits!,
    git: gitContext,
    files: filesContext
  };
}
