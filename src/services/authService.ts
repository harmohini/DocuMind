import type { User } from '../types';
import { getLocalUserId } from '../utils/userId';

const AUTH_KEY = 'documind_auth_user';

export const authService = {
  isConfigured: (): boolean => true,

  login: async (email: string, _password?: string): Promise<User> => {
    const userObj: User = {
      id: getLocalUserId(),
      name: 'Local User',
      email: email ? email.trim() : 'local@device',
      role: 'Local User',
      organization: 'Local Workspace'
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(userObj));
    return userObj;
  },

  signup: async (data: { name: string; email: string; organization: string; password?: string }): Promise<{ user: User; requiresConfirmation: boolean }> => {
    const userObj: User = {
      id: getLocalUserId(),
      name: data.name || 'Local User',
      email: data.email || 'local@device',
      role: 'Local User',
      organization: data.organization || 'Local Workspace'
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(userObj));
    return { user: userObj, requiresConfirmation: false };
  },

  forgotPassword: async (_email: string): Promise<boolean> => {
    return true;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(AUTH_KEY);
  },

  getAccessToken: async (): Promise<string | null> => {
    return "local-demo-token";
  },

  getCurrentUser: (): User => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return {
      id: getLocalUserId(),
      name: 'Local User',
      email: 'local@device',
      role: 'Local User',
      organization: 'Local Workspace'
    };
  },

  isAuthenticated: (): boolean => true
};
