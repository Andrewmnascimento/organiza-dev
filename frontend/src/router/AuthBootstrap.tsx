import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/authStore';

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    let alive = true;
    setLoading();

    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [setLoading, setSession]);

  return children;
}