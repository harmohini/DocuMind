export const LOCAL_USER_ID_KEY = 'documind_user_id';

export function getLocalUserId(): string {
  let userId = localStorage.getItem(LOCAL_USER_ID_KEY);
  if (!userId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      userId = crypto.randomUUID();
    } else {
      userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    localStorage.setItem(LOCAL_USER_ID_KEY, userId);
  }
  return userId;
}
