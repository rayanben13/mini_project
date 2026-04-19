const TOKEN_KEY = "token";

const isBrowser = typeof window !== "undefined";

export const tokenManager = {
  get: () => {
    if (!isBrowser) return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  set: (token) => {
    if (!isBrowser) return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  remove: () => {
    if (!isBrowser) return;
    localStorage.removeItem(TOKEN_KEY);
  },

  exists: () => {
    if (!isBrowser) return false;
    return !!localStorage.getItem(TOKEN_KEY);
  },
};
