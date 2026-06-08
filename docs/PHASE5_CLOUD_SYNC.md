# Phase 5 — Cloud save sync

One Supabase account = one cloud save. The game still works offline as a guest (IndexedDB only).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. **Authentication → Providers → Email**: enable Email; magic link is on by default.
3. **Authentication → URL configuration**: add your dev URL (e.g. `http://localhost:5173`) and production URL to **Redirect URLs**.

## 2. Create the saves table

In **SQL Editor**, run the script in [`supabase/schema.sql`](../supabase/schema.sql).

## 3. Configure the app

```bash
cp .env.example .env
```

Set from **Project Settings → API**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (anon public key)

Restart `npm run dev` after changing `.env`.

## 4. How sync works

| State | Behavior |
|-------|----------|
| Guest (not signed in) | Saves to IndexedDB only |
| Signed in | Loads cloud save on login; debounced upload ~800ms after changes |
| Both saves differ | Modal: **This device** vs **Cloud** |

Sign in via **Sign in** (top right) → email magic link.

## 5. Test on two devices

1. Sign in on desktop, play a bit, wait for **Synced** status.
2. Sign in with the same email on phone → cloud save should load.
3. If both had different progress before linking, pick which save to keep in the conflict dialog.
