import { create } from 'zustand';
import { authAPI } from '../lib/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  init: async () => {
    const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
    if (!token) return set({ loading: false });
    try {
      const { data } = await authAPI.me();
      set({ user: data.user, loading: false });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user });
    return data.user;
  },

  register: async (payload) => {
    const { data } = await authAPI.register(payload);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user });
    return data.user;
  },

  logout: async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null });
  },
}));
