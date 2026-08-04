import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../game/GameContext';

function getSyncLabel(syncStatus: string, signedIn: boolean): string {
  if (!signedIn) return 'Local only';
  if (syncStatus === 'syncing') return 'Syncing…';
  if (syncStatus === 'synced') return 'Synced';
  if (syncStatus === 'error') return 'Sync error';
  return 'Cloud ready';
}

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
  const { syncStatus, syncNow } = useGame();
  const [open, setOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const signedIn = Boolean(user);
  const syncLabel = getSyncLabel(syncStatus, signedIn);

  const syncDot =
    syncStatus === 'synced'
      ? 'bg-emerald-400'
      : syncStatus === 'syncing'
        ? 'bg-amber-400 animate-pulse'
        : syncStatus === 'error'
          ? 'bg-rose-400'
          : signedIn
            ? 'bg-sky-400'
            : 'bg-stone-500';

  const headerLabel = !configured
    ? 'Cloud setup'
    : signedIn
      ? (email ?? 'Account')
      : 'Sign in';

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
          {headerLabel}
        </button>

        {open && (
          <div className="w-72 rounded-xl border border-white/10 bg-stone-950/95 p-3 shadow-2xl backdrop-blur-md">
            {!configured ? (
              <>
                <p className="text-sm text-stone-200">Cloud sync not configured</p>
                <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
                  Copy <span className="text-stone-400">.env.example</span> to{' '}
                  <span className="text-stone-400">.env</span>, add your Supabase URL and anon key,
                  run <span className="text-stone-400">supabase/schema.sql</span>, then restart{' '}
                  <span className="text-stone-400">npm run dev</span>.
                </p>
                <p className="mt-2 text-[11px] text-stone-500">
                  See <span className="text-stone-400">docs/PHASE5_CLOUD_SYNC.md</span> for steps.
                </p>
                <p className="mt-3 text-[11px] text-stone-600">
                  Guest play still works — saves stay on this device.
                </p>
              </>
            ) : signedIn ? (
              <>
                <p className="text-[10px] uppercase tracking-wide text-stone-500">Signed in</p>
                <p className="truncate text-sm text-stone-100">{email}</p>
                <p className="mt-2 flex items-center gap-2 text-[11px] text-stone-400">
                  <span className={`h-1.5 w-1.5 rounded-full ${syncDot}`} />
                  {syncLabel}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={syncNow}
                    disabled={syncStatus === 'syncing'}
                    className="flex-1 rounded-lg bg-white/10 py-2 text-xs text-stone-200 transition hover:bg-white/15 disabled:opacity-50"
                  >
                    Sync now
                  </button>
                  <button
                    type="button"
                    disabled={authLoading}
                    onClick={() => void signOut()}
                    className="flex-1 rounded-lg bg-white/5 py-2 text-xs text-stone-300 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    Sign out
                  </button>
                </div>
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
