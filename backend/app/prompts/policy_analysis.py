POLICY_ANALYSIS_PROMPT = """You are a Document Analyst Agent specializing in enterprise policy compliance and governance audit.

Analyze the policy text below and produce a structured analysis in JSON:

DOCUMENT: {document_name}
TEXT:
{document_text}

JSON OUTPUT SCHEMA:
{{
  "overallRisk": "High / Medium / Low",
  "riskScore": 25,
  "keyObligationsCount": 2,
  "importantDeadlinesCount": 1,
  "potentialRisksCount": 2,
  "keyClauses": [
    {{
      "name": "Policy Section",
      "status": "Identified",
      "explanation": "Explanation",
      "sourcePage": 1,
      "relevantSection": "Section X.Y",
      "snippet": "Text excerpt"
    }}
  ],
  "obligations": [
    {{
      "party": "Employees / IT / HR",
      "obligation": "Policy compliance requirement",
      "frequency": "Continuous / Annual",
      "deadline": "Immediate",
      "status": "Active"
    }}
  ],
  "deadlines": [],
  "risks": [
    {{
      "severity": "MEDIUM",
      "title": "Compliance Gap",
      "explanation": "Gap explanation",
      "sourcePage": 1,
      "section": "Section X.Y",
      "recommendation": "Update policy text"
    }}
  ],
  "missingInformation": [
    "Missing exception policy details"
  ],
  "recommendations": [
    "Conduct mandatory employee policy training"
  ]
}}
"""
