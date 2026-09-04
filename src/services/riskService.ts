import type { RiskItem } from '../types';

const RISKS_KEY = 'documind_risks';

const getStoredRisks = (): RiskItem[] => {
  const stored = localStorage.getItem(RISKS_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const saveRisks = (risks: RiskItem[]) => {
  localStorage.setItem(RISKS_KEY, JSON.stringify(risks));
};

export const riskService = {
  getRisks: async (): Promise<RiskItem[]> => {
    await new Promise((res) => setTimeout(res, 200));
    return getStoredRisks();
  },

  updateRiskStatus: async (id: string, status: RiskItem['status']): Promise<RiskItem> => {
    await new Promise((res) => setTimeout(res, 250));
    const risks = getStoredRisks();
    const risk = risks.find((r) => r.id === id);
    if (!risk) throw new Error('Risk item not found');
    risk.status = status;
    saveRisks(risks);
    return risk;
  },

  getRiskStats: async () => {
    const risks = getStoredRisks();
    const high = risks.filter((r) => r.severity === 'High').length;
    const medium = risks.filter((r) => r.severity === 'Medium').length;
    const low = risks.filter((r) => r.severity === 'Low').length;
    
    const overallScore = risks.length > 0 ? Math.min(99, Math.max(10, Math.round(100 - (high * 8 + medium * 3)))) : 100;

    return { overallScore, high, medium, low, total: risks.length };
  }
};
