/* auth.js — REAL server-side administrator authentication via Supabase Auth.

   This replaces the old browser-password prototype gate. Security model:
     • Credentials are verified by Supabase Auth (GoTrue) on the server.
       Passwords are bcrypt-hashed server-side and never stored in the browser.
     • A signed JWT access token + refresh token represent the session; they are
       refreshed automatically and kept only in this app's own storage key.
     • Being "logged in" is NOT what grants admin power. Every write to the
       database is independently authorised by Postgres Row Level Security, which
       checks the user is listed in the `admins` table (public.is_admin()).
       Even a forged client cannot write without a real admin JWT.

   The rest of the app calls only AdminAuth.isAuthed/login/logout/subscribe,
   plus a few helpers below. */
(function () {
  "use strict";

  var subs = [];
  var state = { ready: false, user: null, admin: false };

  function notify() { subs.forEach(function (f) { try { f(); } catch (e) {} }); }

  function setSession(user, admin) {
    state.user = user || null;
    state.admin = !!admin;
    notify();
  }

  // Verify the signed-in user is actually an administrator by reading their own
  // row from the RLS-protected `admins` table (a non-admin gets zero rows).
  function refreshAdmin() {
    if (!state.user) { setSession(null, false); return Promise.resolve(false); }
    return window.sb
      .from("admins")
      .select("user_id")
      .eq("user_id", state.user.id)
      .maybeSingle()
      .then(function (res) {
        var ok = !!(res && res.data);
        setSession(state.user, ok);
        return ok;
      })
      .catch(function () { setSession(state.user, false); return false; });
  }

  // Boot: restore any existing session, then track auth changes.
  var ready = window.sb.auth.getSession().then(function (res) {
    var sess = res && res.data ? res.data.session : null;
    state.user = sess ? sess.user : null;
    return refreshAdmin();
  }).then(function () {
    state.ready = true;
    notify();
  });

  window.sb.auth.onAuthStateChange(function (event, session) {
    state.user = session ? session.user : null;
    refreshAdmin();
    if (event === "PASSWORD_RECOVERY") {
      try { window.dispatchEvent(new CustomEvent("ecclesia:recovery")); } catch (e) {}
    }
  });

  window.AdminAuth = {
    ready: function () { return ready; },
    isReady: function () { return state.ready; },
    // "Authed" for the app means: signed in AND confirmed administrator.
    isAuthed: function () { return !!(state.user && state.admin); },
    user: function () { return state.user; },

    // Email + password sign-in. Returns a promise resolving to
    // { ok:true } or { ok:false, error:"message" }.
    login: function (email, password) {
      return window.sb.auth
        .signInWithPassword({ email: String(email || "").trim(), password: String(password || "") })
        .then(function (res) {
          if (res.error) return { ok: false, error: res.error.message };
          state.user = res.data.user;
          return refreshAdmin().then(function (isAdmin) {
            if (!isAdmin) {
              return window.sb.auth.signOut().then(function () {
                return { ok: false, error: "This account is not an administrator." };
              });
            }
            return { ok: true };
          });
        })
        .catch(function (e) { return { ok: false, error: (e && e.message) || "Sign-in failed." }; });
    },

    logout: function () {
      return window.sb.auth.signOut().then(function () { setSession(null, false); });
    },

    // Let a signed-in admin rotate their own password.
    changePassword: function (newPassword) {
      return window.sb.auth.updateUser({ password: String(newPassword || "") })
        .then(function (res) {
          if (res.error) return { ok: false, error: res.error.message };
          return { ok: true };
        })
        .catch(function (e) { return { ok: false, error: (e && e.message) || "Could not update password." }; });
    },

    // Email a password-reset link (used from the login screen).
    resetPassword: function (email) {
      return window.sb.auth.resetPasswordForEmail(String(email || "").trim(), {
        redirectTo: location.origin + location.pathname,
      }).then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        return { ok: true };
      });
    },

    subscribe: function (fn) {
      subs.push(fn);
      return function () { subs = subs.filter(function (f) { return f !== fn; }); };
    },
  };
})();
