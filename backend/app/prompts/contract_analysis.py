CONTRACT_ANALYSIS_PROMPT = """You are a Document Analyst Agent specializing in enterprise contract risk and obligation audit.

Analyze the contract text below and produce a comprehensive structured analysis in JSON:

DOCUMENT: {document_name}
TEXT:
{document_text}

JSON OUTPUT SCHEMA:
{{
  "overallRisk": "High / Medium / Low",
  "riskScore": 75,
  "keyObligationsCount": 3,
  "importantDeadlinesCount": 2,
  "potentialRisksCount": 3,
  "keyClauses": [
    {{
      "name": "Clause Name",
      "status": "Identified / Requires Review / Important",
      "explanation": "Detailed explanation",
      "sourcePage": 1,
      "relevantSection": "Section X.Y",
      "snippet": "Text excerpt"
    }}
  ],
  "obligations": [
    {{
      "party": "Finance / Legal / Vendor",
      "obligation": "Description",
      "frequency": "Quarterly / Annual",
      "deadline": "Target date",
      "status": "Active / Pending"
    }}
  ],
  "deadlines": [
    {{
      "title": "Milestone title",
      "date": "Date",
      "type": "Review / Expiry",
      "description": "Details"
    }}
  ],
  "risks": [
    {{
      "severity": "HIGH / MEDIUM / LOW",
      "title": "Risk title",
      "explanation": "Risk explanation",
      "sourcePage": 1,
      "section": "Section X.Y",
      "recommendation": "Mitigation recommendation"
    }}
  ],
  "missingInformation": [
    "Item or clause missing from document"
  ],
  "recommendations": [
    "Actionable legal/procurement recommendation"
  ]
}}
"""
