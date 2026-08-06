import { AuditContext } from "@/core/domain/aiAuditTypes";

export function buildAuditPrompt(context: AuditContext): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `Eres un Arquitecto de Software Senior y Tech Lead altamente experimentado.
Eres Especialista en Next.js, React, Node.js, Prisma, MySQL, DDD, SOLID, Clean Architecture, Performance y Seguridad.
Tu objetivo es analizar un proyecto a partir del contexto provisto y generar una auditoría exhaustiva.

REGLAS ESTRICTAS:
1. Debes responder EXCLUSIVAMENTE con un JSON válido que coincida exactamente con el esquema AuditResult proporcionado.
2. NUNCA inventes información. Basa tu análisis única y exclusivamente en los datos proporcionados en el contexto.
3. Todo el texto descriptivo en tu respuesta JSON DEBE estar en Español.
4. Para todos los arrays de 'findings' y 'recommendations', debes generar IDs únicos en el formato "f-1", "f-2", etc. para hallazgos, y "r-1", "r-2", etc. para recomendaciones.
5. No incluyas ningún bloque de texto fuera del JSON. Si usas markdown code fences (ej. \`\`\`json), asegúrate de que el contenido interno sea un JSON parseable.
6. Ahora el contexto incluye 'files.sourceFiles' con el código fuente real de los archivos más importantes del proyecto. DEBES leer y analizar este código para detectar vulnerabilidades, patrones de arquitectura, antipatrones y deuda técnica.
7. Al crear 'findings' (hallazgos), DEBES indicar el nombre del archivo ('file') y la línea ('line') exacta si detectas un problema específico en el código fuente provisto.
8. PROHIBIDO REPETIR O DUPLICAR INFORMACIÓN: Cada hallazgo debe figurar en UNA SOLA SECCIÓN. Las vulnerabilidades de seguridad van exclusivamente en 'security.issues'. Los hallazgos de código/arquitectura van exclusivamente en 'findings'. Las recomendaciones generales de alto nivel van en 'recommendations'. NUNCA repitas el mismo problema ni la misma recomendación en múltiples secciones.
`;

  const schemaDefinition = `
{
  "summary": {
    "overallScore": "number (0-100)",
    "grade": "string (A, B, C, D, F)",
    "oneLiner": "string",
    "strengths": ["string"],
    "weaknesses": ["string"],
    "riskLevel": "string (LOW|MEDIUM|HIGH|CRITICAL)"
  },
  "maintainability": {
    "score": "number (0-100)",
    "grade": "string",
    "explanation": "string",
    "strengths": ["string"],
    "weaknesses": ["string"],
    "codeQuality": "number (0-100)",
    "testability": "number (0-100)",
    "readability": "number (0-100)"
  },
  "technicalDebt": {
    "totalHours": "number",
    "priority": "string (LOW|MEDIUM|HIGH|CRITICAL)",
    "impact": "string",
    "risk": "string",
    "items": [{
      "area": "string",
      "description": "string",
      "hours": "number",
      "priority": "string (LOW|MEDIUM|HIGH|CRITICAL)",
      "impact": "string"
    }]
  },
  "security": {
    "overallStatus": "string (SECURE|ACCEPTABLE|AT_RISK|CRITICAL)",
    "critical": "number",
    "high": "number",
    "medium": "number",
    "low": "number",
    "issues": [{
      "severity": "string (CRITICAL|HIGH|MEDIUM|LOW)",
      "title": "string",
      "description": "string",
      "affectedArea": "string",
      "recommendation": "string"
    }]
  },
  "performance": {
    "score": "number (0-100)",
    "areas": [{
      "area": "string",
      "score": "number (0-100)",
      "notes": "string"
    }]
  },
  "architecture": {
    "pattern": "string",
    "adherence": "number (0-100)",
    "layerSeparation": "number (0-100)",
    "notes": "string",
    "violations": ["string"]
  },
  "metrics": {
    "codebaseSize": "string",
    "dependencyCount": "number",
    "testCoverage": "string",
    "documentationCoverage": "string",
    "commitFrequency": "string",
    "teamVelocity": "string"
  },
  "findings": [{
    "id": "string",
    "type": "string (positive|warning|critical)",
    "category": "string (Frontend|Backend|Architecture|Performance|Database|DevOps|Security)",
    "title": "string",
    "file": "string|null",
    "line": "number|null",
    "explanation": "string",
    "impact": "string",
    "solution": "string",
    "priority": "string (LOW|MEDIUM|HIGH|CRITICAL)",
    "estimatedTime": "string"
  }],
  "recommendations": [{
    "id": "string",
    "title": "string",
    "description": "string",
    "category": "string",
    "priority": "string (LOW|MEDIUM|HIGH|CRITICAL)",
    "effort": "string",
    "impact": "string"
  }],
  "nextActions": ["string"]
}
`;

  const userPrompt = `
Analiza el siguiente contexto del proyecto y devuelve el JSON de auditoría correspondiente.
Considera aspectos de arquitectura, calidad de código, dependencias, seguridad, rendimiento, base de datos, equipo y documentación.

CONTEXTO DEL PROYECTO (JSON):
${JSON.stringify(context, null, 2)}

ESQUEMA ESPERADO (JSON):
${schemaDefinition}

Recuerda devolver ÚNICAMENTE el JSON y en idioma Español.
`;

  return { systemPrompt, userPrompt };
}
