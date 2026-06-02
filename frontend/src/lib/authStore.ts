import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  accessToken: string | null;
  setSession: (session: Session | null) => void;
  setLoading: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  session: null,
  user: null,
  accessToken: null,
  setLoading: () => set({ status: 'loading' }),
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      accessToken: session?.access_token ?? null,
      status: session ? 'authenticated' : 'unauthenticated',
    }),
}));

// Helpful for non-React code (fetch wrapper, socket init, etc.)
export const getAccessToken = () => useAuthStore.getState().accessToken;