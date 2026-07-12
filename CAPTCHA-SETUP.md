# Enable hCaptcha on admin sign-in

This adds a "verify you're human" check to the admin **sign-in** and **password-reset**
screens, blocking bots and brute-force attempts. It's off until you complete these steps.

Order matters: do step 1–2, deploy step 3, THEN turn it on in step 4. If you enable it in
Supabase before the site has your site key, sign-in will fail.

## 1. Get free hCaptcha keys
1. Sign up at https://www.hcaptcha.com/ (free).
2. In the hCaptcha dashboard, add a new **site** (any name). Your domain(s):
   - `allvo6377.github.io` (GitHub Pages), and/or your Truehost domain, and
   - `localhost` (so you can test locally).
3. Copy two values:
   - **Site key** (public — goes in the site's code)
   - **Secret key** (private — goes ONLY in Supabase, never in the code)

## 2. Put the site key in the app
Open `js/supabase-config.js` and set:
```js
captchaSiteKey: "YOUR-HCAPTCHA-SITE-KEY",
```
(Leave it `""` to keep hCaptcha off.)

## 3. Deploy the change
Push to GitHub / re-upload to Truehost so the live site has the site key.

## 4. Turn it on in Supabase
1. Supabase dashboard → your project → **Authentication → Attack Protection**
   (older UIs: **Authentication → Settings → Bot and Abuse Protection**).
2. Enable **CAPTCHA protection**, provider **hCaptcha**.
3. Paste your **secret key** → **Save**.

Done. The next time you open the admin sign-in page you'll see the hCaptcha checkbox, and
sign-in / reset won't proceed until it's completed.

## Notes
- The **secret key stays in Supabase only** — it is never in the website code or repo.
- Being already signed in is unaffected; the check applies to new sign-ins and reset requests.
- To turn it off: clear `captchaSiteKey` (redeploy) and disable CAPTCHA in Supabase.
- Prefer Cloudflare Turnstile instead? Supabase supports it too — the steps are the same;
  in `admin-login.jsx` you'd swap the hCaptcha script/widget for Turnstile's. Ask and I can
  switch it.
