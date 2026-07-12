/* supabase-config.js — connection details + shared client.
   The publishable (anon) key is SAFE to ship in the browser: it grants only the
   access your Row Level Security policies allow (public read; writes require a
   signed-in administrator). Real security lives in the database, not this key. */
(function () {
  "use strict";

  window.SUPA = {
    url: "https://esisxzritbjuxksulozb.supabase.co",
    anonKey: "sb_publishable_QZM8kYFE7QV6drhIaWRvvQ_mXp780SR",
    bucket: "parish-images",
    // Optional bot protection on admin sign-in / password reset.
    // Paste your hCaptcha *site key* here (public, safe to ship). Leave "" to
    // disable. You must also enable hCaptcha in Supabase -> Authentication ->
    // Attack Protection and paste your hCaptcha *secret key* there.
    captchaSiteKey: "",
  };

  if (!window.supabase || !window.supabase.createClient) {
    console.error("[Ecclesia] Supabase library failed to load.");
    return;
  }
  window.sb = window.supabase.createClient(window.SUPA.url, window.SUPA.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "ecclesia.auth",
    },
  });
})();
