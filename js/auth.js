/* auth.js — REAL server-side administrator authentication via Supabase Auth.

   Security model:
     - Credentials are verified by Supabase Auth (GoTrue) on the server;
       passwords are bcrypt-hashed server-side and never stored in the browser.
     - A signed JWT + refresh token represent the session, auto-refreshed.
     - Being "logged in" is NOT what grants admin power. Every write is
       authorised by Postgres Row Level Security (public.is_admin()).
     - Optional hCaptcha token is passed through to sign-in / password reset. */
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
    isAuthed: function () { return !!(state.user && state.admin); },
    user: function () { return state.user; },

    login: function (email, password, captchaToken) {
      var opts = {};
      if (captchaToken) opts.captchaToken = captchaToken;
      return window.sb.auth
        .signInWithPassword({ email: String(email || "").trim(), password: String(password || ""), options: opts })
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

    changePassword: function (newPassword) {
      return window.sb.auth.updateUser({ password: String(newPassword || "") })
        .then(function (res) {
          if (res.error) return { ok: false, error: res.error.message };
          return { ok: true };
        })
        .catch(function (e) { return { ok: false, error: (e && e.message) || "Could not update password." }; });
    },

    resetPassword: function (email, captchaToken) {
      var opts = { redirectTo: location.origin + location.pathname };
      if (captchaToken) opts.captchaToken = captchaToken;
      return window.sb.auth.resetPasswordForEmail(String(email || "").trim(), opts).then(function (res) {
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
