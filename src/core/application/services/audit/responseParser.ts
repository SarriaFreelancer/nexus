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

    // Clean and filter out generic LLM security hallucinations
    const rawIssues: any[] = parsed.security?.issues ?? [];
    const genericPhrases = [
      "oauth o jwt", "parameterized queries", "prepared statements", 
      "ssl/tls", "dependabot", "npm audit", "inyección sql", 
      "autenticación insegura", "cifrado de datos"
    ];

    const cleanIssues = rawIssues.filter((issue: any) => {
      if (!issue || typeof issue !== "object") return false;
      const rec = (issue.recommendation || "").toLowerCase();
      const desc = (issue.description || "").toLowerCase();
      const title = (issue.title || "").toLowerCase();

      // If issue has no specific affected file/area AND matches generic textbook phrases, filter it out
      const isGenericTextbook = genericPhrases.some(phrase => rec.includes(phrase) || desc.includes(phrase) || title.includes(phrase));
      const hasSpecificLocation = !!(issue.affectedArea && issue.affectedArea !== "Backend" && issue.affectedArea !== "Frontend" && issue.affectedArea !== "General");

      // Keep only non-generic or location-specific issues
      return !isGenericTextbook || hasSpecificLocation;
    });

    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    cleanIssues.forEach((issue: any) => {
      const s = (issue.severity || "").toLowerCase();
      if (s === "critical") counts.critical++;
      else if (s === "high") counts.high++;
      else if (s === "medium") counts.medium++;
      else counts.low++;
    });

    const isSecure = cleanIssues.length === 0;

    return {
      summary: {
        overallScore: parsed.summary?.overallScore ?? 85,
        grade: parsed.summary?.grade ?? (isSecure ? "A" : "B"),
        oneLiner: parsed.summary?.oneLiner ?? "Auditoría completada exitosamente",
        strengths: parsed.summary?.strengths ?? [],
        weaknesses: parsed.summary?.weaknesses ?? [],
        riskLevel: isSecure ? "LOW" : (parsed.summary?.riskLevel ?? "LOW"),
      },
      maintainability: {
        score: parsed.maintainability?.score ?? 85,
        grade: parsed.maintainability?.grade ?? "B",
        explanation: parsed.maintainability?.explanation ?? "",
        strengths: parsed.maintainability?.strengths ?? [],
        weaknesses: parsed.maintainability?.weaknesses ?? [],
        codeQuality: parsed.maintainability?.codeQuality ?? 85,
        testability: parsed.maintainability?.testability ?? 80,
        readability: parsed.maintainability?.readability ?? 85,
      },
      technicalDebt: {
        totalHours: parsed.technicalDebt?.totalHours ?? 0,
        priority: parsed.technicalDebt?.priority ?? "LOW",
        impact: parsed.technicalDebt?.impact ?? "",
        risk: parsed.technicalDebt?.risk ?? "",
        items: parsed.technicalDebt?.items ?? [],
      },
      security: {
        overallStatus: isSecure ? "SECURE" : (parsed.security?.overallStatus ?? "ACCEPTABLE"),
        critical: counts.critical,
        high: counts.high,
        medium: counts.medium,
        low: counts.low,
        issues: cleanIssues,
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
