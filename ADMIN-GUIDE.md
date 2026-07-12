# Administrator Guide — Ecclesia Kenya

A plain-language guide for running the directory. No coding required.

## Signing in
1. Open the site and click **Admin** (top right).
2. Enter your administrator **email** and **password**.
3. Forgot your password? Click **"Forgot your password?"** to get a reset link by email.

> First thing to do: open the dashboard and click **Change password** to set your own.

## Managing parishes (admin dashboard)
- **Add parish** — fill the form. Only the name is required; the rest is optional.
- **Edit / Delete** — use the buttons on each row of the table.
- **Import CSV** — bulk-add parishes from a spreadsheet; you get a preview before saving.
- **Auto-fill photos** — fetches public photos (Wikimedia Commons) for parishes.
- **Upload photos** — in the parish form, click **Upload** next to the hero image or any
  gallery row to upload straight from your computer. You can also paste image links.
- **Refresh** — reloads the latest data from the database.

## Editing parish photos on the page
While signed in, open any parish page and hover an image — a **Replace** badge appears.
Click it to upload a new photo from your computer. It's saved to that parish instantly.

## Editing the rest of the site (visual editor)
While signed in, click **Edit site** (bottom-right corner):
- **Text** — click any heading or paragraph and type.
- **Images** — click any image (outside parish pages) to upload a replacement.
- **Any block** — click it to get a small toolbar: bigger/smaller text, bold, colour,
  alignment, move up/down, or hide.
- **Theme** — the side panel changes the main colour, heading font, home layout and card
  style.
- Click **Done** when finished. Changes save automatically and appear for all visitors.
- **Reset all site edits** restores the original design (parish records are not affected).

## Adding another administrator
Administrators are managed in your Supabase project:
1. Supabase dashboard → **Authentication → Users → Add user** (set email + password,
   tick "Auto Confirm User").
2. Supabase dashboard → **Table editor → `admins` → Insert row**: paste that user's
   `user_id` (from the Users list) and their email.

That person can now sign in and edit. Remove someone by deleting their `admins` row.

## Signing out
Use **Sign out** in the dashboard, or just close the browser — sessions expire on their
own.
