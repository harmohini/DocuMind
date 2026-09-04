DOCUMENT_SUMMARY_SYSTEM_PROMPT = """You are a senior document analyst. Your task is to produce a structured, high-value summary of an enterprise document based on its type.

Output MUST be valid JSON conforming to the requested schema.
Do not include markdown code block wrappers around the JSON.
"""

CONTRACT_SUMMARY_PROMPT = """Analyze the following contract document text and extract a comprehensive structured summary in JSON format:

DOCUMENT NAME: {document_name}
DOCUMENT TEXT:
{document_text}

JSON OUTPUT SCHEMA:
{{
  "summary": "Multi-paragraph executive narrative summary of the contract.",
  "contractValue": "Extracted total financial value or fee structure (e.g. ₹18,50,000)",
  "duration": "Term length (e.g. 2 Years)",
  "startDate": "Effective start date",
  "expiryDate": "Expiration / Renewal date",
  "renewalType": "Automatic / Manual / None",
  "parties": {{
    "organization": "Primary company name",
    "vendor": "Counterparty / Vendor name"
  }},
  "paymentTerms": "Payment schedule (e.g. Net 30)",
  "terminationNotice": "Notice period (e.g. 30 Days)",
  "governingLaw": "Jurisdiction / Court location",
  "clauses": [
    {{
      "id": "cl-1",
      "name": "Clause Title",
      "status": "Identified / Requires Review / Important",
      "explanation": "Detailed explanation",
      "sourcePage": 1,
      "relevantSection": "Section X.Y",
      "snippet": "Direct text quote from document"
    }}
  ],
  "obligations": [
    {{
      "id": "ob-1",
      "party": "Responsible party",
      "obligation": "Description of obligation",
      "frequency": "One-time / Monthly / Quarterly / Annual",
      "deadline": "Deadline date or timeline",
      "status": "Active / Pending"
    }}
  ],
  "importantDates": [
    {{
      "id": "dt-1",
      "title": "Milestone title",
      "date": "Date text",
      "type": "Start / Review / Expiry",
      "description": "Explanation"
    }}
  ],
  "risks": [
    {{
      "id": "cr-1",
      "severity": "HIGH / MEDIUM / LOW",
      "title": "Risk title",
      "explanation": "Why this represents risk",
      "sourcePage": 1,
      "section": "Section X.Y",
      "recommendation": "Suggested action"
    }}
  ]
}}
"""

POLICY_SUMMARY_PROMPT = """Analyze the following policy document text and extract a structured policy summary in JSON format:

DOCUMENT NAME: {document_name}
DOCUMENT TEXT:
{document_text}

JSON OUTPUT SCHEMA:
{{
  "summary": "Executive narrative summary of policy scope and governance.",
  "purpose": "Primary objective of policy",
  "scope": "Target departments or personnel",
  "rules": ["Core rule 1", "Core rule 2"],
  "responsibilities": ["Responsibility 1", "Responsibility 2"],
  "exceptions": ["Exception condition 1"],
  "complianceRequirements": ["Requirement 1", "Requirement 2"],
  "importantPoints": ["Key point 1", "Key point 2"]
}}
"""

REPORT_SUMMARY_PROMPT = """Analyze the following report document text and extract a structured report summary in JSON format:

DOCUMENT NAME: {document_name}
DOCUMENT TEXT:
{document_text}

JSON OUTPUT SCHEMA:
{{
  "summary": "Executive narrative summary of report findings.",
  "executiveOverview": "Overview narrative",
  "objectives": ["Objective 1", "Objective 2"],
  "keyFindings": ["Finding 1", "Finding 2"],
  "importantMetrics": ["Metric 1", "Metric 2"],
  "conclusions": ["Conclusion 1"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}}
"""
