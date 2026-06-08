import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../game/GameContext';

export function AccountPanel() {
  const {
    configured,
    user,
    email,
    authLoading,
    authError,
    authMessage,
    signInWithEmail,
    signOut,
    clearAuthFeedback,
  } = useAuth();
  const { syncStatus } = useGame();
  const [open, setOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  if (!configured) return null;

  const syncLabel = {
    idle: 'Local only',
    syncing: 'Syncing…',
    synced: 'Synced',
    error: 'Sync error',
  }[syncStatus];

  const syncDot =
    syncStatus === 'synced'
      ? 'bg-emerald-400'
      : syncStatus === 'syncing'
        ? 'bg-amber-400 animate-pulse'
        : syncStatus === 'error'
          ? 'bg-rose-400'
          : 'bg-stone-500';

  return (
    <div className="pointer-events-none absolute right-3 top-3 z-20 pt-[max(0.25rem,env(safe-area-inset-top))]">
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            clearAuthFeedback();
          }}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-stone-950/85 px-3 py-2 text-xs text-stone-200 shadow-lg backdrop-blur-md transition hover:bg-stone-900/90"
        >
          <span className={`h-2 w-2 rounded-full ${syncDot}`} />
          {user ? (email ?? 'Account') : 'Sign in'}
        </button>

        {open && (
          <div className="w-72 rounded-xl border border-white/10 bg-stone-950/95 p-3 shadow-2xl backdrop-blur-md">
            {user ? (
              <>
                <p className="text-[10px] uppercase tracking-wide text-stone-500">Signed in</p>
                <p className="truncate text-sm text-stone-100">{email}</p>
                <p className="mt-2 flex items-center gap-2 text-[11px] text-stone-400">
                  <span className={`h-1.5 w-1.5 rounded-full ${syncDot}`} />
                  {syncLabel}
                </p>
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() => void signOut()}
                  className="mt-3 w-full rounded-lg bg-white/10 py-2 text-xs text-stone-200 transition hover:bg-white/15 disabled:opacity-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-stone-200">Sync your Sim to the cloud</p>
                <p className="mt-1 text-[11px] text-stone-500">
                  Same save on phone and desktop. Magic link — no password.
                </p>
                <form
                  className="mt-3 space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void signInWithEmail(emailInput);
                  }}
                >
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full rounded-lg border border-white/10 bg-stone-900 px-3 py-2 text-sm text-stone-100 outline-none ring-amber-400/40 focus:ring-2"
                    autoComplete="email"
                  />
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full rounded-lg bg-amber-500/25 py-2 text-xs text-amber-100 ring-1 ring-amber-400/40 transition hover:bg-amber-500/35 disabled:opacity-50"
                  >
                    {authLoading ? 'Sending…' : 'Email me a sign-in link'}
                  </button>
                </form>
              </>
            )}

            {authError && <p className="mt-2 text-[11px] text-rose-300">{authError}</p>}
            {authMessage && <p className="mt-2 text-[11px] text-emerald-300">{authMessage}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
