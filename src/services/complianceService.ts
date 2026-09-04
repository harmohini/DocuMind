import type { ComplianceItem } from '../types';
import { reportService } from './reportService';

const COMPLIANCE_KEY = 'documind_compliance';

const getStoredCompliance = (): ComplianceItem[] => {
  const stored = localStorage.getItem(COMPLIANCE_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const saveCompliance = (items: ComplianceItem[]) => {
  localStorage.setItem(COMPLIANCE_KEY, JSON.stringify(items));
};

export const complianceService = {
  getComplianceItems: async (): Promise<ComplianceItem[]> => {
    await new Promise((res) => setTimeout(res, 200));
    return getStoredCompliance();
  },

  updateComplianceStatus: async (id: string, status: ComplianceItem['status']): Promise<ComplianceItem> => {
    await new Promise((res) => setTimeout(res, 200));
    const items = getStoredCompliance();
    const item = items.find((i) => i.id === id);
    if (!item) throw new Error('Compliance item not found');
    item.status = status;
    item.lastAudited = new Date().toISOString().split('T')[0];
    saveCompliance(items);
    return item;
  },

  generateComplianceReport: async () => {
    await new Promise((res) => setTimeout(res, 500));
    const items = getStoredCompliance();
    const passed = items.filter((i) => i.status === 'Passed').length;
    const scorePct = items.length > 0 ? Math.round((passed / items.length) * 100) : 100;

    const newReport = await reportService.generateReport(
      `Enterprise Compliance Audit Report (${new Date().toLocaleDateString()})`,
      'Compliance Audit',
      {
        executiveSummary: `Audit completed across ${items.length} key enterprise compliance categories. Overall Compliance Readiness Score is ${scorePct}%.`,
        keyFindings: items.map((i) => `${i.requirementName}: ${i.status} (${i.notes})`),
        majorRisks: items.filter((i) => i.status === 'Failed').map((i) => `Non-compliant: ${i.requirementName}`),
        complianceStatus: `Overall Compliance Score: ${scorePct}%. ${passed} of ${items.length} categories passed.`,
        deadlinesCount: 3,
        recommendedActions: [
          'Remediate failed compliance clauses within 14 business days.',
          'Schedule follow-up audit with Legal Privacy Board.'
        ]
      }
    );

    return newReport;
  }
};
