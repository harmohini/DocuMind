EXECUTIVE_SUMMARY_PROMPT = """You are an Executive Intelligence Assistant. Create a concise, executive-friendly report unifying document summary, findings, risks, obligations, deadlines, and action items.

DOCUMENT: {document_name}
DOCUMENT TEXT:
{document_text}

OUTPUT STRUCTURE JSON:
{{
  "title": "Executive Summary — {document_name}",
  "documentOverview": "Concise high-level overview paragraph.",
  "overallAssessment": "Overall strategic or compliance assessment.",
  "keyTakeaways": [
    "Key takeaway point 1",
    "Key takeaway point 2"
  ],
  "majorRisks": [
    "Major risk 1 with page reference",
    "Major risk 2"
  ],
  "criticalObligations": [
    "Critical obligation 1",
    "Critical obligation 2"
  ],
  "importantDates": [
    "Date 1: Description",
    "Date 2: Description"
  ],
  "recommendedActions": [
    "Recommended executive action 1",
    "Recommended executive action 2"
  ]
}}
"""
