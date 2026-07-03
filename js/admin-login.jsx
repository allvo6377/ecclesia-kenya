/* admin-login.jsx — administrator sign-in (Supabase email + password). */

function AdminLogin({ navigate }) {
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [mode, setMode] = React.useState("login"); // login | reset
  const [notice, setNotice] = React.useState("");
  const emailRef = React.useRef(null);

  React.useEffect(() => { if (emailRef.current) emailRef.current.focus(); }, []);

  function submit(e) {
    if (e) e.preventDefault();
    setErr(""); setNotice("");
    if (mode === "reset") {
      if (!email.trim()) { setErr("Enter your email to receive a reset link."); return; }
      setBusy(true);
      window.AdminAuth.resetPassword(email).then((r) => {
        setBusy(false);
        if (r.ok) { setNotice("If that email is registered, a password-reset link is on its way."); setMode("login"); }
        else setErr(r.error || "Could not send reset email.");
      });
      return;
    }
    setBusy(true);
    window.AdminAuth.login(email, pw).then((r) => {
      setBusy(false);
      if (r.ok) { setErr(""); /* app re-renders via auth subscription */ }
      else { setErr(r.error || "Sign-in failed."); setPw(""); }
    });
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="login-mark"><window.I.lock style={{ width: 24, height: 24 }} /></div>
        <div className="login-kicker">Restricted area</div>
        <h1 className="serif">Parish administration</h1>
        <p className="login-sub">
          {mode === "login"
            ? "Sign in to add, edit, import and illustrate parish records, and to edit the site. Visitors can browse the directory without signing in."
            : "Enter your administrator email and we'll send a secure link to reset your password."}
        </p>

        <label className="login-field">
          <span>Email</span>
          <input ref={emailRef} type="email" value={email} autoComplete="username"
            onChange={(e) => { setEmail(e.target.value); setErr(""); }}
            placeholder="you@example.org" className={err ? "err" : ""} />
        </label>

        {mode === "login" && (
          <label className="login-field">
            <span>Password</span>
            <input type="password" value={pw} autoComplete="current-password"
              onChange={(e) => { setPw(e.target.value); setErr(""); }}
              placeholder="••••••••••" className={err ? "err" : ""} />
          </label>
        )}

        {err && <div className="login-err"><window.I.warn style={{ width: 14, height: 14 }} /> {err}</div>}
        {notice && <div className="login-note" style={{ background: "var(--primary-tint)" }}>{notice}</div>}

        <button type="submit" className="btn btn-primary login-btn" disabled={busy}>
          {busy ? <span className="spinner" /> : <window.I.lock style={{ width: 16, height: 16 }} />}
          {busy ? " Working…" : (mode === "login" ? " Sign in" : " Send reset link")}
        </button>

        <button type="button" className="login-link"
          onClick={() => { setErr(""); setNotice(""); setMode(mode === "login" ? "reset" : "login"); }}>
          {mode === "login" ? "Forgot your password?" : "Back to sign in"}
        </button>

        <button type="button" className="login-back" onClick={() => navigate("")}>
          <window.I.back style={{ width: 15, height: 15 }} /> Back to directory
        </button>
      </form>
    </div>
  );
}

Object.assign(window, { AdminLogin });
