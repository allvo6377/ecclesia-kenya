/* compiled from admin.jsx — do not edit directly; edit the .jsx source */
/* admin.jsx — admin dashboard: parish management table + toolbar. Exports window.AdminView */

function AdminView({
  navigate,
  parishes
}) {
  const [q, setQ] = React.useState("");
  const [dioFilter, setDioFilter] = React.useState("All");
  const [srcFilter, setSrcFilter] = React.useState("All");
  const [editing, setEditing] = React.useState(null); // church record or "new"
  const [importing, setImporting] = React.useState(false);
  const [autofilling, setAutofilling] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [pwModal, setPwModal] = React.useState(false);
  const [pw1, setPw1] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [pwErr, setPwErr] = React.useState("");
  const [pwBusy, setPwBusy] = React.useState(false);
  const all = parishes || window.ParishStore.getAll();
  const dioceses = React.useMemo(() => ["All", ...window.uniqueSorted(all.map(c => c.diocese))], [all]);

  // Deep-link: open a specific parish's editor when arriving from its page.
  React.useEffect(() => {
    var pid = window.__ecclesiaEdit;
    if (!pid) return;
    window.__ecclesiaEdit = null;
    var rec = (all || []).find(function (c) {
      return c.id === pid;
    }) || window.ParishStore.get(pid);
    if (rec) setEditing(rec);
  }, []);
  function flash(msg) {
    setToast(msg);
    clearTimeout(flash._t);
    flash._t = setTimeout(() => setToast(null), 2600);
  }
  const filtered = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    return all.filter(c => {
      if (dioFilter !== "All" && c.diocese !== dioFilter) return false;
      if (srcFilter === "Imported" && c.source !== "import") return false;
      if (srcFilter === "Sample" && c.source !== "seed") return false;
      if (srcFilter === "Manual" && c.source !== "manual") return false;
      if (ql) {
        const hay = (c.name + " " + c.city + " " + c.diocese + " " + c.county).toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
  }, [all, q, dioFilter, srcFilter]);
  const stats = React.useMemo(() => ({
    total: all.length,
    mapped: all.filter(c => c.coords).length,
    imported: all.filter(c => c.source === "import").length,
    manual: all.filter(c => c.source === "manual").length,
    withPhoto: all.filter(c => c.heroImage).length
  }), [all]);
  function onFormClose(saved) {
    setEditing(null);
    if (saved) flash("Parish saved.");
  }
  function onImportClose(done) {
    setImporting(false);
    if (done) flash("Import complete.");
  }
  function onAutofillClose(done) {
    setAutofilling(false);
    if (done) flash("Parish photos updated.");
  }
  function doDelete() {
    if (!deleteTarget) return;
    window.ParishStore.remove(deleteTarget.id);
    setDeleteTarget(null);
    flash("Parish removed.");
  }
  function doRefresh() {
    window.ParishStore.load().then(() => flash("Refreshed from the database."));
  }
  function changePassword() {
    setPwErr("");
    if (pw1.length < 10) {
      setPwErr("Use at least 10 characters.");
      return;
    }
    if (pw1 !== pw2) {
      setPwErr("The two passwords don't match.");
      return;
    }
    setPwBusy(true);
    window.AdminAuth.changePassword(pw1).then(r => {
      setPwBusy(false);
      if (r.ok) {
        setPwModal(false);
        setPw1("");
        setPw2("");
        flash("Password updated.");
      } else setPwErr(r.error || "Could not update password.");
    });
  }
  const srcLabel = {
    seed: "Sample",
    import: "Imported",
    manual: "Manual"
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "admin"
  }, /*#__PURE__*/React.createElement("div", {
    className: "admin-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "admin-hero-inner"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Administration"), /*#__PURE__*/React.createElement("h1", {
    className: "serif"
  }, "Manage parishes"), /*#__PURE__*/React.createElement("p", null, "Add, edit and import parish records. Changes are saved securely to your database and appear instantly across the directory, map and diocese views.")), /*#__PURE__*/React.createElement("div", {
    className: "admin-hero-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => setAutofilling(true)
  }, /*#__PURE__*/React.createElement(window.I.globe, null), " Auto-fill photos"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => setImporting(true)
  }, /*#__PURE__*/React.createElement(window.I.upload, null), " Import CSV"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => setEditing("new")
  }, /*#__PURE__*/React.createElement(window.I.plus, null), " Add parish"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-signout",
    onClick: () => {
      window.AdminAuth.logout();
      navigate("");
    }
  }, /*#__PURE__*/React.createElement(window.I.signout, null), " Sign out")))), /*#__PURE__*/React.createElement("div", {
    className: "admin-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "admin-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "astat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "as-num"
  }, stats.total), /*#__PURE__*/React.createElement("div", {
    className: "as-lbl"
  }, "Total parishes")), /*#__PURE__*/React.createElement("div", {
    className: "astat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "as-num"
  }, stats.mapped), /*#__PURE__*/React.createElement("div", {
    className: "as-lbl"
  }, "On the map")), /*#__PURE__*/React.createElement("div", {
    className: "astat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "as-num"
  }, stats.withPhoto), /*#__PURE__*/React.createElement("div", {
    className: "as-lbl"
  }, "With a photo")), /*#__PURE__*/React.createElement("div", {
    className: "astat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "as-num"
  }, stats.imported), /*#__PURE__*/React.createElement("div", {
    className: "as-lbl"
  }, "Imported")), /*#__PURE__*/React.createElement("div", {
    className: "astat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "as-num"
  }, stats.manual), /*#__PURE__*/React.createElement("div", {
    className: "as-lbl"
  }, "Added manually"))), /*#__PURE__*/React.createElement("div", {
    className: "admin-toolbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "search admin-search"
  }, /*#__PURE__*/React.createElement("span", {
    className: "s-icon"
  }, /*#__PURE__*/React.createElement(window.I.search, null)), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Search parishes…"
  })), /*#__PURE__*/React.createElement("div", {
    className: "select-wrap"
  }, /*#__PURE__*/React.createElement("select", {
    value: dioFilter,
    onChange: e => setDioFilter(e.target.value)
  }, dioceses.map(dd => /*#__PURE__*/React.createElement("option", {
    key: dd
  }, dd === "All" ? "All dioceses" : dd))), /*#__PURE__*/React.createElement("span", {
    className: "chev"
  }, /*#__PURE__*/React.createElement(window.I.chev, null))), /*#__PURE__*/React.createElement("div", {
    className: "select-wrap"
  }, /*#__PURE__*/React.createElement("select", {
    value: srcFilter,
    onChange: e => setSrcFilter(e.target.value)
  }, ["All", "Sample", "Imported", "Manual"].map(x => /*#__PURE__*/React.createElement("option", {
    key: x
  }, x === "All" ? "All sources" : x))), /*#__PURE__*/React.createElement("span", {
    className: "chev"
  }, /*#__PURE__*/React.createElement(window.I.chev, null))), /*#__PURE__*/React.createElement("div", {
    className: "tb-spacer"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: doRefresh
  }, /*#__PURE__*/React.createElement(window.I.reset, null), " Refresh"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => {
      setPwErr("");
      setPw1("");
      setPw2("");
      setPwModal(true);
    }
  }, /*#__PURE__*/React.createElement(window.I.lock, {
    style: {
      width: 14,
      height: 14
    }
  }), " Change password")), /*#__PURE__*/React.createElement("div", {
    className: "admin-count"
  }, filtered.length, " of ", all.length, " parishes"), /*#__PURE__*/React.createElement("div", {
    className: "table-card"
  }, /*#__PURE__*/React.createElement("table", {
    className: "parish-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Parish"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Diocese"), /*#__PURE__*/React.createElement("th", null, "Area"), /*#__PURE__*/React.createElement("th", {
    className: "ta-c"
  }, "Map"), /*#__PURE__*/React.createElement("th", {
    className: "ta-c"
  }, "Times"), /*#__PURE__*/React.createElement("th", null, "Source"), /*#__PURE__*/React.createElement("th", {
    className: "ta-r"
  }, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, filtered.map(c => /*#__PURE__*/React.createElement("tr", {
    key: c.id
  }, /*#__PURE__*/React.createElement("td", {
    className: "pt-name"
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => navigate(c.id)
  }, c.name)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "mini-chip"
  }, c.type)), /*#__PURE__*/React.createElement("td", {
    className: "pt-dim"
  }, c.diocese), /*#__PURE__*/React.createElement("td", null, [c.city, c.county].filter(Boolean).join(", ") || "—"), /*#__PURE__*/React.createElement("td", {
    className: "ta-c"
  }, c.coords ? /*#__PURE__*/React.createElement("span", {
    className: "dot-ok"
  }) : /*#__PURE__*/React.createElement("span", {
    className: "dot-no"
  })), /*#__PURE__*/React.createElement("td", {
    className: "ta-c"
  }, c.massTimes.length ? /*#__PURE__*/React.createElement("span", {
    className: "num-badge"
  }, c.massTimes.length) : /*#__PURE__*/React.createElement("span", {
    className: "pt-dim"
  }, "—")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "src-tag src-" + c.source
  }, srcLabel[c.source] || c.source)), /*#__PURE__*/React.createElement("td", {
    className: "ta-r"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    title: "Edit",
    onClick: () => setEditing(c)
  }, /*#__PURE__*/React.createElement(window.I.edit, {
    style: {
      width: 16,
      height: 16
    }
  })), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn danger",
    title: "Delete",
    onClick: () => setDeleteTarget(c)
  }, /*#__PURE__*/React.createElement(window.I.trash, {
    style: {
      width: 16,
      height: 16
    }
  })))))), filtered.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 8
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty",
    style: {
      margin: "18px 0"
    }
  }, "No parishes match your filters."))))))), editing && /*#__PURE__*/React.createElement(window.ParishForm, {
    church: editing === "new" ? null : editing,
    allDioceses: dioceses.filter(x => x !== "All"),
    onClose: onFormClose
  }), importing && /*#__PURE__*/React.createElement(window.ImportModal, {
    onClose: onImportClose
  }), autofilling && /*#__PURE__*/React.createElement(window.AutofillModal, {
    parishes: all,
    onClose: onAutofillClose
  }), deleteTarget && /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onMouseDown: () => setDeleteTarget(null)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal-confirm",
    onMouseDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "confirm-icon danger"
  }, /*#__PURE__*/React.createElement(window.I.trash, {
    style: {
      width: 22,
      height: 22
    }
  })), /*#__PURE__*/React.createElement("h3", null, "Delete this parish?"), /*#__PURE__*/React.createElement("p", {
    className: "muted"
  }, /*#__PURE__*/React.createElement("b", null, deleteTarget.name), " will be permanently removed from the directory. This can’t be undone."), /*#__PURE__*/React.createElement("div", {
    className: "confirm-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => setDeleteTarget(null)
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-danger",
    onClick: doDelete
  }, /*#__PURE__*/React.createElement(window.I.trash, {
    style: {
      width: 16,
      height: 16
    }
  }), " Delete parish")))), pwModal && /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onMouseDown: () => setPwModal(false)
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
  })), /*#__PURE__*/React.createElement("h3", null, "Change your password"), /*#__PURE__*/React.createElement("p", {
    className: "muted"
  }, "Choose a new administrator password (at least 10 characters). You'll stay signed in."), /*#__PURE__*/React.createElement("div", {
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
      setPwErr("");
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
      setPwErr("");
    },
    placeholder: "••••••••••"
  })), pwErr && /*#__PURE__*/React.createElement("div", {
    className: "login-err"
  }, /*#__PURE__*/React.createElement(window.I.warn, {
    style: {
      width: 14,
      height: 14
    }
  }), " ", pwErr)), /*#__PURE__*/React.createElement("div", {
    className: "confirm-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => setPwModal(false)
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: changePassword,
    disabled: pwBusy
  }, pwBusy ? /*#__PURE__*/React.createElement("span", {
    className: "spinner"
  }) : /*#__PURE__*/React.createElement(window.I.check, {
    style: {
      width: 16,
      height: 16
    }
  }), " Update password")))), toast && /*#__PURE__*/React.createElement("div", {
    className: "toast"
  }, /*#__PURE__*/React.createElement(window.I.check, {
    style: {
      width: 16,
      height: 16
    }
  }), " ", toast));
}
Object.assign(window, {
  AdminView
});