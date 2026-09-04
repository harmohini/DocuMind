import type { ReportItem } from '../types';

const REPORTS_KEY = 'documind_reports';

const getStoredReports = (): ReportItem[] => {
  const stored = localStorage.getItem(REPORTS_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const saveReports = (items: ReportItem[]) => {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(items));
};

export const reportService = {
  getReports: async (): Promise<ReportItem[]> => {
    await new Promise((res) => setTimeout(res, 200));
    return getStoredReports();
  },

  getReportById: async (id: string): Promise<ReportItem | undefined> => {
    await new Promise((res) => setTimeout(res, 150));
    const reports = getStoredReports();
    return reports.find((r) => r.id === id);
  },

  generateReport: async (
    title: string,
    type: ReportItem['type'],
    contentSummary?: ReportItem['contentSummary']
  ): Promise<ReportItem> => {
    await new Promise((res) => setTimeout(res, 400));
    const reports = getStoredReports();
    
    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      title,
      type,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Generated',
      fileSize: '1.9 MB',
      contentSummary: contentSummary || {
        executiveSummary: 'Automated executive assessment of document intelligence corpus.',
        keyFindings: [
          'Risk score detected in vendor indemnification clause.',
          'Compliance audit verified for infrastructure.',
          'Upcoming renewal deadline requires opt-out notice.'
        ],
        majorRisks: ['Uncapped Liability Exposure'],
        complianceStatus: 'Overall compliance score: 84%',
        deadlinesCount: 4,
        recommendedActions: ['Execute legal amendment before Q3 renewal.']
      }
    };

    saveReports([newReport, ...reports]);
    return newReport;
  },

  deleteReport: async (id: string): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 200));
    const reports = getStoredReports();
    const updated = reports.filter((r) => r.id !== id);
    saveReports(updated);
    return true;
  }
};
