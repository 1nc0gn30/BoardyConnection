import { useEffect, useState } from 'react';
import type { User } from 'netlify-identity-widget';

let started = false;

function isLocalHost() {
  if (typeof window === 'undefined') return true;
  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

function getWidget() {
  if (typeof window === 'undefined') return null;
  return import('netlify-identity-widget').then((mod) => mod.default);
}

async function startWidget() {
  const identity = await getWidget();
  if (!identity) return null;
  if (!started) {
    identity.init();
    started = true;
  }
  return identity;
}

export function useNetlifyIdentity() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const attach = async () => {
      if (isLocalHost()) {
        setReady(true);
        return;
      }
      const identity = await startWidget();
      if (!identity || cancelled) {
        setReady(true);
        return;
      }
      const sync = (next?: User | null) => {
        if (!cancelled) setUser(next ?? identity.currentUser());
      };
      sync(identity.currentUser());
      identity.on('init', sync);
      identity.on('login', (next) => {
        sync(next);
        identity.close();
      });
      identity.on('logout', () => sync(null));
      setReady(true);
    };

    attach().catch(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const open = async (tab: 'login' | 'signup' = 'login') => {
    const identity = await startWidget();
    if (!identity) return;
    identity.on('login', (next) => {
      setUser(next);
      identity.close();
    });
    identity.on('logout', () => setUser(null));
    identity.open(tab);
  };

  const logout = async () => {
    const identity = await getWidget();
    identity?.logout();
    setUser(null);
  };

  const getToken = async (): Promise<string | null> => {
    const identity = started ? await getWidget() : null;
    const current = user ?? identity?.currentUser() ?? null;
    if (!current?.token?.access_token) return null;
    try {
      await current.jwt();
    } catch {
      // Token refresh is best-effort.
    }
    return current.token.access_token;
  };

  return {
    user,
    ready,
    email: user?.email || user?.user_metadata?.full_name || null,
    open,
    logout,
    getToken,
  };
}
