# Security model — Ecclesia Kenya

## What protects the admin area
1. **Server-side authentication (Supabase Auth / GoTrue).** Credentials are verified on
   Supabase's servers. Passwords are stored only as bcrypt hashes; the browser never
   sees or stores a password. A successful sign-in returns a signed JWT access token plus
   a refresh token, kept in this app's own storage key and refreshed automatically.

2. **Authorisation enforced by the database, not the page.** Every table has Postgres
   **Row Level Security** turned on:
   - `parishes`, `site_content`: anyone may **read**; only an administrator may
     **insert / update / delete**.
   - "Administrator" = a row in the `admins` table matching the signed-in user
     (`public.is_admin()`), checked inside each write policy.
   - `admins`: a user can read only their own row; no client writes.

   This means even a tampered or fully rewritten front-end **cannot** change data without
   a genuine administrator's token. The login screen is a convenience, not the security
   boundary — the database is.

3. **Storage.** The `parish-images` bucket is readable by the public (so photos display)
   but writable only by administrators. Listing the bucket is disabled.

4. **Publishable key.** `js/supabase-config.js` ships the *publishable* (anon) key. This
   is by design and safe: it can do only what the policies above allow.

## Verified during build
- Simulated administrator writes succeed; simulated anonymous writes are **rejected** by
  the policies.
- All previously-existing tables in the project had RLS enabled so nothing is exposed via
  the API.
- The `is_admin()` helper is not callable by anonymous users.

## Recommended one-time hardening (in the Supabase dashboard)
- **Authentication → Providers → Email:** keep "Confirm email" on; turn **off** open
  sign-ups if you don't want anyone creating accounts (admins are added manually).
- **Authentication → Policies / Password:** enable **Leaked password protection**
  (checks new passwords against HaveIBeenPwned) and set a minimum length.
- **Authentication → URL Configuration:** set your real Site URL and Redirect URLs after
  deploying, so password-reset links work.
- Consider enabling **MFA** for administrator accounts.
- Rotate the first administrator password immediately (Change password in the dashboard).
