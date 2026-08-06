import { GitContext, GitCommit, RepoTreeItem } from "@/core/domain/aiAuditTypes";

export async function collectGitContext(gitRepoUrl: string, gitToken: string | null): Promise<GitContext | null> {
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
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Nexus-Audit-Engine"
    };

    // Repo Info
    const repoRes = await fetch(`https://api.github.com/repos/${repo}`, { headers, cache: "no-store" });
    if (!repoRes.ok) return null;
    const repoData = await repoRes.json();

    // Branches
    const branchesRes = await fetch(`https://api.github.com/repos/${repo}/branches?per_page=100`, { headers, cache: "no-store" });
    const branches = branchesRes.ok ? await branchesRes.json() : [];

    // Commits
    const commitsRes = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=10`, { headers, cache: "no-store" });
    const commitsData = commitsRes.ok ? await commitsRes.json() : [];
    
    const recentCommits: GitCommit[] = commitsData.map((c: any) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author.name,
      date: c.commit.author.date
    }));

    const contributorsSet = new Set<string>();
    recentCommits.forEach(c => contributorsSet.add(c.author));

    // Languages
    const languagesRes = await fetch(`https://api.github.com/repos/${repo}/languages`, { headers, cache: "no-store" });
    const languages = languagesRes.ok ? await languagesRes.json() : {};

    // Repo Tree (Recursive)
    const defaultBranch = repoData.default_branch;
    const treeRes = await fetch(`https://api.github.com/repos/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers, cache: "no-store" });
    const treeData = treeRes.ok ? await treeRes.json() : { tree: [] };
    
    // Limit tree items in context
    const MAX_TREE_ITEMS = 40;
    const allTreeItems = treeData.tree || [];
    
    // Only pass the most relevant items to the prompt (prioritize src, app, lib, exclude node_modules/dist)
    const filteredTree = allTreeItems.filter((t: any) => 
      !t.path.includes('node_modules/') && 
      !t.path.includes('.next/') && 
      !t.path.includes('dist/') &&
      !t.path.includes('.git/')
    );
    
    const limitedTree = filteredTree.slice(0, MAX_TREE_ITEMS);

    const repoStructure: RepoTreeItem[] = limitedTree.map((t: any) => ({
      path: t.path,
      type: t.type,
      size: t.size
    }));

    const hasReadme = allTreeItems.some((item: any) => item.path.toLowerCase() === 'readme.md');

    return {
      repoFullName: repoData.full_name,
      defaultBranch,
      language: repoData.language,
      size: repoData.size,
      openIssues: repoData.open_issues_count,
      forksCount: repoData.forks_count,
      starsCount: repoData.stargazers_count,
      license: repoData.license?.name || null,
      branchesCount: branches.length,
      recentCommits,
      contributors: Array.from(contributorsSet),
      languages,
      hasReadme,
      repoStructure
    };
  } catch (error) {
    console.error("Error collecting git context:", error);
    return null;
  }
}
