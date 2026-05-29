import { create } from 'zustand';
import type { Member } from '../types';
import { getProfile } from '../services/api';

interface UserState {
  user: Member | null;
  token: string | null;
  login: (token: string, user: Member) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),

  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  fetchProfile: async () => {
    const user = await getProfile() as unknown as Member;
    set({ user });
  },
}));
