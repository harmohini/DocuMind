import type { DeadlineItem } from '../types';

const DEADLINES_KEY = 'documind_deadlines';

const getStoredDeadlines = (): DeadlineItem[] => {
  const stored = localStorage.getItem(DEADLINES_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const saveDeadlines = (items: DeadlineItem[]) => {
  localStorage.setItem(DEADLINES_KEY, JSON.stringify(items));
};

export const deadlineService = {
  getDeadlines: async (): Promise<DeadlineItem[]> => {
    await new Promise((res) => setTimeout(res, 200));
    return getStoredDeadlines();
  },

  addDeadline: async (item: Omit<DeadlineItem, 'id'>): Promise<DeadlineItem> => {
    await new Promise((res) => setTimeout(res, 250));
    const items = getStoredDeadlines();
    const newItem: DeadlineItem = {
      ...item,
      id: `dl-${Date.now()}`
    };
    saveDeadlines([newItem, ...items]);
    return newItem;
  },

  toggleDeadlineStatus: async (id: string): Promise<DeadlineItem> => {
    await new Promise((res) => setTimeout(res, 200));
    const items = getStoredDeadlines();
    const item = items.find((d) => d.id === id);
    if (!item) throw new Error('Deadline not found');
    item.status = item.status === 'Completed' ? 'Pending' : 'Completed';
    saveDeadlines(items);
    return item;
  },

  deleteDeadline: async (id: string): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 200));
    const items = getStoredDeadlines();
    const updated = items.filter((d) => d.id !== id);
    saveDeadlines(updated);
    return true;
  }
};
