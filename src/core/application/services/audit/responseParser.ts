import { AuditResult } from "@/core/domain/aiAuditTypes";

export function parseAuditResponse(rawContent: string): AuditResult {
  let jsonString = rawContent.trim();
  
  // Extract JSON if wrapped in markdown code fences
  if (jsonString.startsWith("\`\`\`json")) {
    jsonString = jsonString.substring(7);
  } else if (jsonString.startsWith("\`\`\`")) {
    jsonString = jsonString.substring(3);
  }
  
  if (jsonString.endsWith("\`\`\`")) {
    jsonString = jsonString.substring(0, jsonString.length - 3);
  }
  
  jsonString = jsonString.trim();

  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    throw new Error("Failed to parse AI response as JSON");
  }

  // Provide sensible defaults for missing fields to ensure typed AuditResult
  return {
    summary: {
      overallScore: parsed.summary?.overallScore ?? 0,
      grade: parsed.summary?.grade ?? "F",
      oneLiner: parsed.summary?.oneLiner ?? "No summary provided",
      strengths: parsed.summary?.strengths ?? [],
      weaknesses: parsed.summary?.weaknesses ?? [],
      riskLevel: parsed.summary?.riskLevel ?? "MEDIUM",
    },
    maintainability: {
      score: parsed.maintainability?.score ?? 0,
      grade: parsed.maintainability?.grade ?? "F",
      explanation: parsed.maintainability?.explanation ?? "",
      strengths: parsed.maintainability?.strengths ?? [],
      weaknesses: parsed.maintainability?.weaknesses ?? [],
      codeQuality: parsed.maintainability?.codeQuality ?? 0,
      testability: parsed.maintainability?.testability ?? 0,
      readability: parsed.maintainability?.readability ?? 0,
    },
    technicalDebt: {
      totalHours: parsed.technicalDebt?.totalHours ?? 0,
      priority: parsed.technicalDebt?.priority ?? "LOW",
      impact: parsed.technicalDebt?.impact ?? "",
      risk: parsed.technicalDebt?.risk ?? "",
      items: parsed.technicalDebt?.items ?? [],
    },
    security: {
      overallStatus: parsed.security?.overallStatus ?? "AT_RISK",
      critical: parsed.security?.critical ?? 0,
      high: parsed.security?.high ?? 0,
      medium: parsed.security?.medium ?? 0,
      low: parsed.security?.low ?? 0,
      issues: parsed.security?.issues ?? [],
    },
    performance: {
      score: parsed.performance?.score ?? 0,
      areas: parsed.performance?.areas ?? [],
    },
    architecture: {
      pattern: parsed.architecture?.pattern ?? "Unknown",
      adherence: parsed.architecture?.adherence ?? 0,
      layerSeparation: parsed.architecture?.layerSeparation ?? 0,
      notes: parsed.architecture?.notes ?? "",
      violations: parsed.architecture?.violations ?? [],
    },
    metrics: {
      codebaseSize: parsed.metrics?.codebaseSize ?? "Unknown",
      dependencyCount: parsed.metrics?.dependencyCount ?? 0,
      testCoverage: parsed.metrics?.testCoverage ?? "Unknown",
      documentationCoverage: parsed.metrics?.documentationCoverage ?? "Unknown",
      commitFrequency: parsed.metrics?.commitFrequency ?? "Unknown",
      teamVelocity: parsed.metrics?.teamVelocity ?? "Unknown",
    },
    findings: parsed.findings ?? [],
    recommendations: parsed.recommendations ?? [],
    nextActions: parsed.nextActions ?? [],
  };
}
