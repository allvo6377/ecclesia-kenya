# Ecclesia Kenya — Catholic Parish Directory

A public directory of Catholic parishes, cathedrals, basilicas and shrines across the
dioceses of Kenya. Visitors can search parishes, filter by diocese or Mass language,
find the nearest one, explore an interactive map, browse by diocese, and open a full
parish page. Administrators get a secure area to add/edit/import parishes and a
**no-code visual editor** to change the site's text, images, colours and layout.

This is the production build. It runs as a set of static files (no build step) backed by
**Supabase** for the database, authentication and image storage.

---

## 1. Run it on your computer (local preview)

The pages load each other over the network, so you need a small local web server
(opening `index.html` directly with `file://` will not work).

From inside this `site` folder, run **one** of these:

```bash
# Python (already on most computers)
python -m http.server 5173

# or Node.js
npx serve .
```

Then open the address it prints (e.g. `http://localhost:5173`).

---

## 2. Put it online (deploy)

Because it's just static files, you can host it free on any static host. Easiest options:

- **Netlify** — drag-and-drop this `site` folder onto https://app.netlify.com/drop
- **Vercel** — `vercel` in this folder, or import the folder in the dashboard
- **Cloudflare Pages** or **GitHub Pages** — upload/commit this folder

No server configuration is needed. After deploying, add your live URL to Supabase so
auth links work: **Supabase dashboard → Authentication → URL Configuration → Site URL /
Redirect URLs**.

---

## 3. Signing in as administrator

1. Click **Admin** in the top navigation (or "Parish administration" in the footer).
2. Sign in with your administrator email and password.
3. First-time credentials were set up for you — **change your password immediately**
   from the admin dashboard ("Change password"). See the separate `ADMIN-GUIDE.md`.

Only accounts listed in the database's `admins` table can sign in or make changes.

---

## 4. Editing content (no code)

**Parish records** — In the admin dashboard you can add, edit, delete, import a CSV of
parishes, and auto-find photos. On any parish page (while signed in) you can click an
image frame to upload a replacement straight from your computer.

**The rest of the site** — While signed in, click **Edit site** (bottom-right). Then:

- Click any heading or paragraph to retype it.
- Click any image to upload a replacement.
- Click any block to style it (size, colour, alignment, bold), hide it, or move it.
- Use the panel to change the theme colour, heading font, home layout and card style.

Everything you change is saved to your database and is what visitors see. "Reset all
site edits" in the panel restores the original design.

---

## 5. How security works

- Sign-in is handled by **Supabase Auth** on the server. Passwords are hashed
  server-side; the browser only ever holds a short-lived, auto-refreshing session token.
- **Every** change to the database is independently authorised by Postgres **Row Level
  Security**: the public can read, but only a signed-in administrator (a row in the
  `admins` table) can write. A forged or modified page still cannot write anything.
- Image uploads go to a storage bucket that is public to read but admin-only to write.
- The key in `js/supabase-config.js` is the **publishable** key and is safe to ship —
  it grants only what the security policies allow.

See `SECURITY.md` for the full model and the recommended dashboard hardening steps.

---

## 6. File map

```
index.html              page shell, loads everything
styles.css              main design
styles-admin.css        admin area design
styles-editor.css       visual editor UI
js/supabase-config.js   your Supabase URL + publishable key
js/auth.js              administrator authentication (Supabase Auth)
js/store.js             parish data (Supabase Postgres) + CSV import
js/editor.js            the no-code visual editor + content overrides
js/imagesearch.js       optional photo finder (Wikimedia Commons)
js/*.js                 the views the browser runs (home, map, dioceses, parish, admin)
js/*.jsx                editable source for each vie