/* compiled from app.jsx — do not edit directly; edit the .jsx source */
/* app.jsx — root: routing, chrome, theme, auth state. */

const THEME_DEFAULTS = {
  primaryColor: "#1462b8",
  headingFont: "Newsreader",
  homeLayout: "split",
  cardStyle: "border"
};

/* hex helpers for derived shades */
function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
}
function mix(hex, target, t) {
  const a = hexToRgb(hex),
    b = hexToRgb(target);
  return rgbToHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
}
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
function Topbar({
  route,
  onNav,
  authed
}) {
  const is = r => route === r ? "nav-link active" : "nav-link";
  return /*#__PURE__*/React.createElement("header", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand-bar"
  }), /*#__PURE__*/React.createElement("div", {
    className: "topbar-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand",
    onClick: () => onNav("")
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand-mark"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/logo.png",
    alt: "Ecclesia Kenya logo"
  })), /*#__PURE__*/React.createElement("div", {
    className: "brand-text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t1"
  }, "Ecclesia Kenya"), /*#__PURE__*/React.createElement("div", {
    className: "t2"
  }, "Catholic Parish Directory"))), /*#__PURE__*/React.createElement("nav", {
    className: "nav-links"
  }, /*#__PURE__*/React.createElement("a", {
    className: is(""),
    onClick: () => onNav("")
  }, "Home"), /*#__PURE__*/React.createElement("a", {
    className: is("map"),
    onClick: () => onNav("map")
  }, "Map"), /*#__PURE__*/React.createElement("a", {
    className: is("dioceses"),
    onClick: () => onNav("dioceses")
  }, "Dioceses"), /*#__PURE__*/React.createElement("a", {
    className: is("admin") + " nav-admin",
    onClick: () => onNav("admin")
  }, /*#__PURE__*/React.createElement(window.I.lock, {
    style: {
      width: 14,
      height: 14
    }
  }), " Admin", authed ? " · on" : "")), /*#__PURE__*/React.createElement("div", {
    className: "topbar-spacer"
  })));
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
    const onTheme = e => setTheme(Object.assign({}, THEME_DEFAULTS, e.detail || {}));
    window.addEventListener("ecclesia:theme", onTheme);
    return () => window.removeEventListener("ecclesia:theme", onTheme);
  }, []);
  return theme;
}
function RecoveryModal({
  onClose,
  navigate
}) {
  const [pw1, setPw1] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  function submit(e) {
    if (e) e.preventDefault();
    setErr("");
    if (pw1.length < 10) {
      setErr("Use at least 10 characters.");
      return;
    }
    if (pw1 !== pw2) {
      setErr("The two passwords don't match.");
      return;
    }
    setBusy(true);
    window.AdminAuth.changePassword(pw1).then(r => {
      setBusy(false);
      if (r.ok) {
        alert("Password updated. You can now sign in with your new password.");
        onClose();
        navigate("admin");
      } else setErr(r.error || "Could not update password. Request a new reset link and try again.");
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onMouseDown: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal-confirm",
    onMouseDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "confirm-icon"
  }, /*#__PURE__*/React.createElement(window.I.lock, {
    style: {
      width: 22,
      height: 22
    }
  })), /*#__PURE__*/React.createElement("h3", null, "Set a new password"), /*#__PURE__*/React.createElement("p", {
    className: "muted"
  }, "You opened a password-reset link. Choose a new administrator password (at least 10 characters)."), /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    style: {
      textAlign: "left",
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "login-field"
  }, /*#__PURE__*/React.createElement("span", null, "New password"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: pw1,
    autoComplete: "new-password",
    onChange: e => {
      setPw1(e.target.value);
      setErr("");
    },
    placeholder: "••••••••••"
  })), /*#__PURE__*/React.createElement("label", {
    className: "login-field"
  }, /*#__PURE__*/React.createElement("span", null, "Confirm new password"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: pw2,
    autoComplete: "new-password",
    onChange: e => {
      setPw2(e.target.value);
      setErr("");
    },
    placeholder: "••••••••••"
  })), err && /*#__PURE__*/React.createElement("div", {
    className: "login-err"
  }, /*#__PURE__*/React.createElement(window.I.warn, {
    style: {
      width: 14,
      height: 14
    }
  }), " ", err), /*#__PURE__*/React.createElement("div", {
    className: "confirm-actions"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary",
    disabled: busy
  }, busy ? /*#__PURE__*/React.createElement("span", {
    className: "spinner"
  }) : /*#__PURE__*/React.createElement(window.I.check, {
    style: {
      width: 16,
      height: 16
    }
  }), " Update password")))));
}
function App() {
  const theme = useTheme();
  const [route, setRoute] = React.useState(() => (location.hash || "").replace("#", ""));
  const [parishes, loaded] = useParishes();
  const [authed, setAuthed] = React.useState(() => window.AdminAuth.isAuthed());
  React.useEffect(() => window.AdminAuth.subscribe(() => setAuthed(window.AdminAuth.isAuthed())), []);
  React.useEffect(() => {
    applyTheme(theme);
  }, [theme.primaryColor, theme.headingFont]);
  React.useEffect(() => {
    applyTheme(THEME_DEFAULTS);
  }, []); // first paint

  React.useEffect(() => {
    const onHash = () => setRoute((location.hash || "").replace("#", ""));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // surface write errors (e.g. session expired) to the admin
  React.useEffect(() => {
    const onErr = e => {
      try {
        alert("Change not saved: " + e.detail + "\n\nYou may need to sign in again.");
      } catch (x) {}
    };
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
  const navigate = target => {
    if (target) location.hash = target;else {
      history.pushState("", document.title, location.pathname + location.search);
    }
    setRoute(target || "");
    window.scrollTo(0, 0);
  };
  const RESERVED = {
    "": 1,
    map: 1,
    dioceses: 1,
    admin: 1
  };
  const church = !RESERVED[route] ? parishes.find(c => c.id === route) : null;
  let body;
  if (!loaded && parishes.length === 0 && RESERVED[route] !== undefined && route !== "admin") {
    body = /*#__PURE__*/React.createElement("div", {
      className: "loading-splash"
    }, /*#__PURE__*/React.createElement("span", {
      className: "spinner",
      style: {
        width: 26,
        height: 26
      }
    }), /*#__PURE__*/React.createElement("p", null, "Loading the parish directory…"));
  } else if (!RESERVED[route] && !church && !loaded) {
    body = /*#__PURE__*/React.createElement("div", {
      className: "loading-splash"
    }, /*#__PURE__*/React.createElement("span", {
      className: "spinner",
      style: {
        width: 26,
        height: 26
      }
    }), /*#__PURE__*/React.createElement("p", null, "Loading…"));
  } else if (church) {
    body = /*#__PURE__*/React.createElement(window.ChurchPage, {
      church: church,
      navigate: navigate,
      admin: authed
    });
  } else if (route === "admin") {
    body = authed ? /*#__PURE__*/React.createElement(window.AdminView, {
      navigate: navigate,
      parishes: parishes
    }) : /*#__PURE__*/React.createElement(window.AdminLogin, {
      navigate: navigate
    });
  } else if (route === "dioceses") {
    body = /*#__PURE__*/React.createElement(window.DiocesesView, {
      navigate: navigate,
      parishes: parishes
    });
  } else if (!RESERVED[route] && !church) {
    body = /*#__PURE__*/React.createElement("div", {
      className: "empty",
      style: {
        margin: "80px auto",
        maxWidth: 520
      }
    }, "That parish could not be found. ", /*#__PURE__*/React.createElement("a", {
      style: {
        color: "var(--primary)",
        fontWeight: 600,
        cursor: "pointer"
      },
      onClick: () => navigate("")
    }, "Back to the directory →"));
  } else {
    body = /*#__PURE__*/React.createElement(window.DirectoryView, {
      navigate: navigate,
      tweaks: theme,
      parishes: parishes,
      mode: route === "map" ? "map" : "directory"
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement(Topbar, {
    route: church ? "" : route,
    onNav: navigate,
    authed: authed
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "view-anim",
    key: route || "home"
  }, body)), /*#__PURE__*/React.createElement("footer", {
    className: "foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "foot-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand",
    style: {
      cursor: "default"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand-mark",
    style: {
      width: 32,
      height: 32
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/logo.png",
    alt: "Ecclesia Kenya logo"
  })), /*#__PURE__*/React.createElement("div", {
    className: "brand-text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t1",
    style: {
      fontSize: 16
    }
  }, "Ecclesia Kenya"))), /*#__PURE__*/React.createElement("div", {
    className: "f-note"
  }, "A directory of the Catholic Church in Kenya — cathedrals and parishes across every archdiocese and diocese, with Mass times, contacts and locations. Please confirm service times with the parish office before visiting."), /*#__PURE__*/React.createElement("a", {
    className: "f-admin",
    onClick: () => navigate("admin")
  }, /*#__PURE__*/React.createElement(window.I.gear, {
    style: {
      width: 14,
      height: 14
    }
  }), " Parish administration"))), recovery && /*#__PURE__*/React.createElement(RecoveryModal, {
    onClose: () => {
      setRecovery(false);
      history.replaceState("", document.title, location.pathname + location.search);
    },
    navigate: navigate
  }));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));