// ============================================================
// AI Audit Engine — Domain Types & Interfaces
// ============================================================

// ---------- AI Provider ----------

export interface AiProviderConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AiProviderResponse {
  content: string;
  tokensInput: number;
  tokensOutput: number;
  model: string;
}

export interface IAiProvider {
  name: string;
  analyze(systemPrompt: string, userPrompt: string): Promise<AiProviderResponse>;
}

// ---------- Audit Context (what we send to the AI) ----------

export interface AuditContext {
  project: ProjectContext;
  tasks: TasksContext;
  versions: VersionsContext;
  team: TeamContext;
  documentation: DocumentationContext;
  servers: ServerContext;
  financials: FinancialsContext;
  previousAudits: PreviousAuditContext[];
  git: GitContext | null;
  files: FilesContext | null;
}

export interface ProjectContext {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: string;
  priority: string;
  category: string;
  technologies: string[];
  gitRepoUrl: string | null;
  serverDomain: string | null;
  estimatedHours: number | null;
  actualHours: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  clientName: string | null;
}

export interface TasksContext {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdue: number;
  unassigned: number;
  averageCompletionDays: number | null;
  completionRate: number;
  totalEstimatedHours: number;
  totalLoggedHours: number;
}

export interface VersionsContext {
  total: number;
  latest: { version: string; title: string; releaseDate: string; changelog: string } | null;
  releaseFrequencyDays: number | null;
  versions: { version: string; title: string; releaseDate: string; tasksCount: number }[];
}

export interface TeamContext {
  totalMembers: number;
  byRole: Record<string, number>;
  members: { name: string; role: string; tasksAssigned: number }[];
}

export interface DocumentationContext {
  totalDocs: number;
  byCategory: Record<string, number>;
  hasDocs: boolean;
}

export interface ServerContext {
  total: number;
  servers: { name: string; provider: string; status: string; cpu: number; ram: number; disk: number }[];
}

export interface FinancialsContext {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  recordCount: number;
}

export interface PreviousAuditContext {
  score: number;
  createdAt: string;
  provider: string;
  findingsCount: number;
}

export interface GitContext {
  repoFullName: string;
  defaultBranch: string;
  language: string | null;
  size: number;
  openIssues: number;
  forksCount: number;
  starsCount: number;
  license: string | null;
  branchesCount: number;
  recentCommits: GitCommit[];
  contributors: string[];
  languages: Record<string, number>;
  hasReadme: boolean;
  repoStructure: RepoTreeItem[];
}

export interface GitCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface RepoTreeItem {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

export interface FilesContext {
  packageJson: PackageJsonAnalysis | null;
  prismaSchema: PrismaSchemaAnalysis | null;
  tsConfig: Record<string, any> | null;
  fileStats: FileStats;
  sourceFiles?: { path: string; content: string }[];
}

export interface PackageJsonAnalysis {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  totalDependencies: number;
  totalDevDependencies: number;
  hasTypescript: boolean;
  hasEslint: boolean;
  hasPrettier: boolean;
  nextVersion: string | null;
  reactVersion: string | null;
  prismaVersion: string | null;
}

export interface PrismaSchemaAnalysis {
  provider: string;
  modelsCount: number;
  enumsCount: number;
  models: { name: string; fieldsCount: number; hasRelations: boolean }[];
  enums: string[];
  hasIndexes: boolean;
}

export interface FileStats {
  totalFiles: number;
  totalDirectories: number;
  filesByExtension: Record<string, number>;
  largestFiles: { path: string; size: number }[];
  directoryStructure: string[];
}

// ---------- AI Audit Result (what the AI returns) ----------

export interface AuditResult {
  summary: AuditSummary;
  maintainability: MaintainabilityResult;
  technicalDebt: TechnicalDebtResult;
  security: SecurityResult;
  performance: PerformanceResult;
  architecture: ArchitectureResult;
  metrics: AuditMetrics;
  findings: AuditFinding[];
  recommendations: AuditRecommendation[];
  nextActions: string[];
}

export interface AuditSummary {
  overallScore: number;
  grade: string; // A, B, C, D, F
  oneLiner: string;
  strengths: string[];
  weaknesses: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface MaintainabilityResult {
  score: number;
  grade: string;
  explanation: string;
  strengths: string[];
  weaknesses: string[];
  codeQuality: number;
  testability: number;
  readability: number;
}

export interface TechnicalDebtResult {
  totalHours: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  impact: string;
  risk: string;
  items: TechnicalDebtItem[];
}

export interface TechnicalDebtItem {
  area: string;
  description: string;
  hours: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  impact: string;
}

export interface SecurityResult {
  overallStatus: "SECURE" | "ACCEPTABLE" | "AT_RISK" | "CRITICAL";
  critical: number;
  high: number;
  medium: number;
  low: number;
  issues: SecurityIssue[];
}

export interface SecurityIssue {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  affectedArea: string;
  recommendation: string;
}

export interface PerformanceResult {
  score: number;
  areas: { area: string; score: number; notes: string }[];
}

export interface ArchitectureResult {
  pattern: string;
  adherence: number;
  layerSeparation: number;
  notes: string;
  violations: string[];
}

export interface AuditMetrics {
  codebaseSize: string;
  dependencyCount: number;
  testCoverage: string;
  documentationCoverage: string;
  commitFrequency: string;
  teamVelocity: string;
}

export interface AuditFinding {
  id: string;
  type: "positive" | "warning" | "critical";
  category: "Frontend" | "Backend" | "Architecture" | "Performance" | "Database" | "DevOps" | "Security";
  title: string;
  file: string | null;
  line: number | null;
  explanation: string;
  impact: string;
  solution: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  estimatedTime: string;
}

export interface AuditRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  effort: string;
  impact: string;
}
