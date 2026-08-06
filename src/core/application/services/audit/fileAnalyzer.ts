import { FilesContext, RepoTreeItem, PackageJsonAnalysis, PrismaSchemaAnalysis, FileStats } from "@/core/domain/aiAuditTypes";

export async function analyzeProjectFiles(
  gitRepoUrl: string, 
  gitToken: string | null, 
  defaultBranch: string, 
  repoTree: RepoTreeItem[]
): Promise<FilesContext | null> {
  try {
    const repo = gitRepoUrl
      .replace(/^https?:\/\/(www\.)?github\.com\//, "")
      .replace(/^github\.com\//, "")
      .replace(/\.git$/i, "")
      .replace(/\/$/, "");

    const token = gitToken || process.env.GITHUB_TOKEN || process.env.GITHUB_TOCKEN;
    if (!token) return null;

    const headers = {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3.raw",
      "User-Agent": "Nexus-Audit-Engine"
    };

    const fetchFile = async (path: string): Promise<string | null> => {
      const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${defaultBranch}`, { headers, cache: "no-store" });
      if (!res.ok) return null;
      return res.text();
    };

    let packageJsonAnalysis: PackageJsonAnalysis | null = null;
    let prismaSchemaAnalysis: PrismaSchemaAnalysis | null = null;
    let tsConfigAnalysis: Record<string, any> | null = null;

    // --- Package JSON ---
    const packageJsonContent = await fetchFile("package.json");
    if (packageJsonContent) {
      try {
        const pkg = JSON.parse(packageJsonContent);
        const deps = pkg.dependencies || {};
        const devDeps = pkg.devDependencies || {};
        packageJsonAnalysis = {
          name: pkg.name || "",
          version: pkg.version || "",
          dependencies: deps,
          devDependencies: devDeps,
          scripts: pkg.scripts || {},
          totalDependencies: Object.keys(deps).length,
          totalDevDependencies: Object.keys(devDeps).length,
          hasTypescript: !!(deps.typescript || devDeps.typescript),
          hasEslint: !!(deps.eslint || devDeps.eslint),
          hasPrettier: !!(deps.prettier || devDeps.prettier),
          nextVersion: deps.next || null,
          reactVersion: deps.react || null,
          prismaVersion: deps.prisma || devDeps.prisma || null,
        };
      } catch (e) {
        console.error("Failed to parse package.json", e);
      }
    }

    // --- Prisma Schema ---
    const prismaSchemaContent = await fetchFile("prisma/schema.prisma");
    if (prismaSchemaContent) {
      const modelsCount = (prismaSchemaContent.match(/model\s+\w+\s+\{/g) || []).length;
      const enums = prismaSchemaContent.match(/enum\s+(\w+)\s+\{/g) || [];
      const enumsCount = enums.length;
      const hasIndexes = prismaSchemaContent.includes("@@index");
      const providerMatch = prismaSchemaContent.match(/provider\s*=\s*"([^"]+)"/);
      const provider = providerMatch ? providerMatch[1] : "unknown";

      const modelsRegex = /model\s+(\w+)\s+\{([\s\S]*?)\}/g;
      const models = [];
      let match;
      while ((match = modelsRegex.exec(prismaSchemaContent)) !== null) {
        const name = match[1];
        const body = match[2];
        const fieldsCount = body.split("\n").filter(l => l.trim() && !l.trim().startsWith("//")).length;
        const hasRelations = body.includes("@relation");
        models.push({ name, fieldsCount, hasRelations });
      }

      prismaSchemaAnalysis = {
        provider,
        modelsCount,
        enumsCount,
        models,
        enums: enums.map(e => e.replace(/enum\s+/, "").replace(/\s+\{/, "")),
        hasIndexes
      };
    }

    // --- TSConfig ---
    const tsConfigContent = await fetchFile("tsconfig.json");
    if (tsConfigContent) {
      try {
        // Strip single line & multi line comments + trailing commas
        const cleanContent = tsConfigContent
          .replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m)
          .replace(/,\s*([\}\]])/g, "$1");
        tsConfigAnalysis = JSON.parse(cleanContent).compilerOptions || {};
      } catch {
        tsConfigAnalysis = null;
      }
    }

    // --- File Stats ---
    const totalFiles = repoTree.filter(t => t.type === "blob").length;
    const totalDirectories = repoTree.filter(t => t.type === "tree").length;
    const filesByExtension: Record<string, number> = {};
    const largestFiles = repoTree
      .filter(t => t.type === "blob" && t.size)
      .sort((a, b) => (b.size || 0) - (a.size || 0))
      .slice(0, 10)
      .map(t => ({ path: t.path, size: t.size || 0 }));
    const directoryStructure = repoTree.filter(t => t.type === "tree").map(t => t.path);

    repoTree.forEach(t => {
      if (t.type === "blob") {
        const extMatch = t.path.match(/\.([^.]+)$/);
        const ext = extMatch ? extMatch[1] : "unknown";
        filesByExtension[ext] = (filesByExtension[ext] || 0) + 1;
      }
    });

    const fileStats: FileStats = {
      totalFiles,
      totalDirectories,
      filesByExtension,
      largestFiles,
      directoryStructure
    };

    // --- Fetch Source Files ---
    const sourceFiles: { path: string; content: string }[] = [];
    
    // Filter relevant files
    const relevantExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.md'];
    const excludePatterns = ['node_modules', '.next', 'dist', 'build', 'public', '.git'];
    
    const candidateFiles = repoTree.filter(t => {
      if (t.type !== 'blob') return false;
      if (t.size && t.size > 20000) return false; // Skip files > 20kb to avoid huge minified/bundled files
      const pathStr = t.path.toLowerCase();
      if (excludePatterns.some(p => pathStr.includes(p))) return false;
      return relevantExtensions.some(ext => pathStr.endsWith(ext));
    });

    // Prioritize src/ and take up to 10 key files for deep analysis
    const sortedFiles = candidateFiles.sort((a, b) => {
      const aSrc = a.path.startsWith('src/') ? -1 : 1;
      const bSrc = b.path.startsWith('src/') ? -1 : 1;
      if (aSrc !== bSrc) return aSrc - bSrc;
      return (a.size || 0) - (b.size || 0); // Smaller files first after src priority
    }).slice(0, 10);

    // Fetch in chunks of 5
    const chunkSize = 5;
    let totalChars = 0;
    // Cap code characters at 8,000 to keep overall prompt context ~5,000 tokens (well below Groq 12,000 TPM limit)
    const MAX_CHARS = 8000;

    for (let i = 0; i < sortedFiles.length; i += chunkSize) {
      if (totalChars >= MAX_CHARS) break;
      
      const chunk = sortedFiles.slice(i, i + chunkSize);
      const promises = chunk.map(async (f) => {
        const content = await fetchFile(f.path);
        return { path: f.path, content };
      });
      
      const results = await Promise.all(promises);
      for (const res of results) {
        if (res.content) {
          if (totalChars + res.content.length > MAX_CHARS) continue;
          sourceFiles.push({ path: res.path, content: res.content });
          totalChars += res.content.length;
        }
      }
    }

    return {
      packageJson: packageJsonAnalysis,
      prismaSchema: prismaSchemaAnalysis,
      tsConfig: tsConfigAnalysis,
      fileStats,
      sourceFiles
    };
  } catch (error) {
    console.error("Error analyzing files:", error);
    return null;
  }
}
