/* app.jsx — root: routing, chrome, theme, auth state. */

const THEME_DEFAULTS = {
  primaryColor: "#1462b8",
  headingFont: "Newsreader",
  homeLayout: "split",
  cardStyle: "border",
};

/* hex helpers for derived shades */
function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgbToHex(r, g, b) { return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join(""); }
function mix(hex, target, t) { const a = hexToRgb(hex), b = hexToRgb(target); return rgbToHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t); }

function applyTheme(t) {
  t = Object.assign({}, THEME_DEFAULTS, t || {});
  const r = document.documentElement;
  r.style.setProperty("--primary", t.primaryColor);
  r.style.setProperty("--primary-deep", mix(t.primaryColor, "#000000", 0.22));
  r.style.setProperty("--primary-soft", mix(t.primaryColor, "#ffffff", 0.88));
  r.style.setProperty("--primary-tint", mix(t.primaryColor, "#ffffff", 0.95));
  r.style.setProperty("--serif", `"${t.headingFont}", Georgia, serif`);
}
// expose so the site editor can apply theme for every visitor
window.applyTheme = applyTheme;

function Topbar({ route, onNav, authed }) {
  const is = (r) => route === r ? "nav-link active" : "nav-link";
  return (
    <header className="topbar">
      <div className="brand-bar" />
      <div className="topbar-inner">
        <div className="brand" onClick={() => onNav("")}>
          <div className="brand-mark"><img src="assets/logo.png" alt="Ecclesia Kenya logo" /></div>
          <div className="brand-text">
            <div className="t1">Ecclesia Kenya</div>
            <div className="t2">Catholic Parish Directory</div>
          </div>
        </div>
        <nav className="nav-links">
          <a className={is("")} onClick={() => onNav("")}>Home</a>
          <a className={is("map")} onClick={() => onNav("map")}>Map</a>
          <a className={is("dioceses")} onClick={() => onNav("dioceses")}>Dioceses</a>
          <a className={is("admin") + " nav-admin"} onClick={() => onNav("admin")}>
            <window.I.lock style={{ width: 14, height: 14 }} /> Admin{authed ? " · on" : ""}
          </a>
        </nav>
        <div className="topbar-spacer" />
      </div>
    </header>);
}

function useParishes() {
  const [list, setList] = React.useState(() => window.ParishStore.getAll());
  const [loaded, setLoaded] = React.useState(() => window.ParishStore.isLoaded());
  React.useEffect(() => window.ParishStore.subscribe(() => {
    setList(window.ParishStore.getAll());
    setLoaded(window.ParishStore.isLoaded());
  }), []);
  return [list, loaded];
}

function useTheme() {
  const [theme, setTheme] = React.useState(THEME_DEFAULTS);
  React.useEffect(() => {
    const onTheme = (e) => setTheme(Object.assign({}, THEME_DEFAULTS, e.detail || {}));
    window.addEventListener("ecclesia:theme", onTheme);
    return () => window.removeEventListener("ecclesia:theme", onTheme);
  }, []);
  return theme;
}

function RecoveryModal({ onClose, navigate }) {
  const [pw1, setPw1] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  function submit(e) {
    if (e) e.preventDefault();
    setErr("");
    if (pw1.length < 10) { setErr("Use at least 10 characters."); return; }
    if (pw1 !== pw2) { setErr("The two passwords don't match."); return; }
    setBusy(true);
    window.AdminAuth.changePassword(pw1).then((r) => {
      setBusy(false);
      if (r.ok) { alert("Password updated. You can now sign in with your new password."); onClose(); navigate("admin"); }
      else setErr(r.error || "Could not update password. Request a new reset link and try again.");
    });
  }
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal modal-confirm" onMouseDown={(e) => e.stopPropagation()}>
        <div className="confirm-icon"><window.I.lock style={{ width: 22, height: 22 }} /></div>
        <h3>Set a new password</h3>
        <p className="muted">You opened a password-reset link. Choose a new administrator password (at least 10 characters).</p>
        <form onSubmit={submit} style={{ textAlign: "left", marginTop: 6 }}>
          <label className="login-field"><span>New password</span>
            <input type="password" value={pw1} autoComplete="new-password" onChange={(e) => { setPw1(e.target.value); setErr(""); }} placeholder="••••••••••" /></label>
          <label className="login-field"><span>Confirm new password</span>
            <input type="password" value={pw2} autoComplete="new-password" onChange={(e) => { setPw2(e.target.value); setErr(""); }} placeholder="••••••••••" /></label>
          {err && <div className="login-err"><window.I.warn style={{ width: 14, height: 14 }} /> {err}</div>}
          <div className="confirm-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? <span className="spinner" /> : <window.I.check style={{ width: 16, height: 16 }} />} Update password</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  const theme = useTheme();
  const [route, setRoute] = React.useState(() => (location.hash || "").replace("#", ""));
  const [parishes, loaded] = useParishes();
  const [authed, setAuthed] = React.useState(() => window.AdminAuth.isAuthed());

  React.useEffect(() => window.AdminAuth.subscribe(() => setAuthed(window.AdminAuth.isAuthed())), []);
  React.useEffect(() => { applyTheme(theme); }, [theme.primaryColor, theme.headingFont]);
  React.useEffect(() => { applyTheme(THEME_DEFAULTS); }, []); // first paint

  React.useEffect(() => {
    const onHash = () => setRoute((location.hash || "").replace("#", ""));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // surface write errors (e.g. session expired) to the admin
  React.useEffect(() => {
    const onErr = (e) => { try { alert("Change not saved: " + e.detail + "\n\nYou may need to sign in again."); } catch (x) {} };
    window.addEventListener("ecclesia:writeerror", onErr);
    return () => window.removeEventListener("ecclesia:writeerror", onErr);
  }, []);

  // password-reset link handling: Supabase fires PASSWORD_RECOVERY when the
  // emailed link opens the site; show a "set new password" prompt.
  const [recovery, setRecovery] = React.useState(false);
  React.useEffect(() => {
    const onRec = () => setRecovery(true);
    window.addEventListener("ecclesia:recovery", onRec);
    return () => window.removeEventListener("ecclesia:recovery", onRec);
  }, []);

  const navigate = (target) => {
    if (target) location.hash = target;
    else { history.pushState("", document.title, location.pathname + location.search); }
    setRoute(target || "");
    window.scrollTo(0, 0);
  };

  const RESERVED = { "": 1, map: 1, dioceses: 1, admin: 1 };
  const church = !RESERVED[route] ? parishes.find((c) => c.id === route) : null;

  let body;
  if (!loaded && parishes.length === 0 && RESERVED[route] !== undefined && route !== "admin") {
    body = (
      <div className="loading-splash">
        <span className="spinner" style={{ width: 26, height: 26 }} />
        <p>Loading the parish directory…</p>
      </div>
    );
  } else if (!RESERVED[route] && !church && !loaded) {
    body = <div className="loading-splash"><span className="spinner" style={{ width: 26, height: 26 }} /><p>Loading…</p></div>;
  } else if (church) {
    body = <window.ChurchPage church={church} navigate={navigate} admin={authed} />;
  } else if (route === "admin") {
    body = authed ? <window.AdminView navigate={navigate} parishes={parishes} /> : <window.AdminLogin navigate={navigate} />;
  } else if (route === "dioceses") {
    body = <window.DiocesesView navigate={navigate} parishes={parishes} />;
  } else if (!RESERVED[route] && !church) {
    body = (
      <div className="empty" style={{ margin: "80px auto", maxWidth: 520 }}>
        That parish could not be found. <a style={{ color: "var(--primary)", fontWeight: 600, cursor: "pointer" }} onClick={() => navigate("")}>Back to the directory →</a>
      </div>
    );
  } else {
    body = <window.DirectoryView navigate={navigate} tweaks={theme} parishes={parishes} mode={route === "map" ? "map" : "directory"} />;
  }

  return (
    <div className="app">
      <Topbar route={church ? "" : route} onNav={navigate} authed={authed} />
      <main style={{ flex: 1 }}>
        <div className="view-anim" key={route || "home"}>{body}</div>
      </main>
      <footer className="foot">
        <div className="foot-inner">
          <div className="brand" style={{ cursor: "default" }}>
            <div className="brand-mark" style={{ width: 32, height: 32 }}><img src="assets/logo.png" alt="Ecclesia Kenya logo" /></div>
            <div className="brand-text"><div className="t1" style={{ fontSize: 16 }}>Ecclesia Kenya</div></div>
          </div>
          <div className="f-note">A directory of the Catholic Church in Kenya — cathedrals and parishes across every archdiocese and diocese, with Mass times, contacts and locations. Please confirm service times with the parish office before visiting.</div>
          <a className="f-admin" onClick={() => navigate("admin")}><window.I.gear style={{ width: 14, height: 14 }} /> Parish administration</a>
        </div>
      </footer>
      {recovery && <RecoveryModal onClose={() => { setRecovery(false); history.replaceState("", document.title, location.pathname + location.search); }} navigate={navigate} />}
    </div>);
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
