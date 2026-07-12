# Deploy Ecclesia Kenya to GitHub + GitHub Pages

This folder is a ready-to-publish copy of the site. Follow these steps once.

## A. Put the code on GitHub

1. Install **Git for Windows** if you don't have it: https://git-scm.com/download/win
   (accept the defaults during install).
2. Go to https://github.com/new and create a **new, empty** repository:
   - Name: `ecclesia-kenya` (or anything you like)
   - Visibility: **Public** (required for free GitHub Pages)
   - Do **not** add a README, .gitignore or licence (leave them unticked)
   - Click **Create repository**, then copy the URL it shows
     (looks like `https://github.com/YOURNAME/ecclesia-kenya.git`)
3. Double-click **`push-to-github.bat`** in this folder, paste that URL when asked, press Enter.
   - The first time, a GitHub sign-in window may open — approve it.
   - When it finishes, your code is on GitHub.

> Prefer typing commands yourself? In this folder run:
> ```
> git init -b main
> git add -A
> git commit -m "Ecclesia Kenya"
> git remote add origin https://github.com/YOURNAME/ecclesia-kenya.git
> git push -u origin main
> ```

## B. Turn on GitHub Pages (the live website)

1. On GitHub, open your repo → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Branch: **main**, Folder: **/ (root)** → **Save**.
4. Wait about a minute, then refresh. Your live address appears at the top:
   `https://YOURNAME.github.io/ecclesia-kenya/`

That address is your public site. It updates automatically every time you push changes.

## C. One setting in Supabase (so admin password-reset emails work)

1. Go to your Supabase dashboard → your project → **Authentication → URL Configuration**.
2. Set **Site URL** to your Pages address, e.g. `https://YOURNAME.github.io/ecclesia-kenya/`
3. Add the same address under **Redirect URLs** → **Save**.

Login and all data already work without this; it only affects the "forgot password" link.

## Updating the site later

- Content (text, images, parishes, Mass times, theme) is edited **live** in the site's
  admin area / visual editor — you do **not** need to touch GitHub for that.
- Only if you change the site's *code* do you push again: double-click `push-to-github.bat`
  (or run `git add -A && git commit -m "update" && git push`).

## Notes

- The `README.md`, `ADMIN-GUIDE.md` and `SECURITY.md` in this folder explain how to use and
  secure the site.
- The Supabase key in `js/supabase-config.js` is the **publishable** key and is safe to be
  public — the admin-only protection lives in the database (Row Level Security).
