/* compiled from admin-autofill.jsx — do not edit directly; edit the .jsx source */
/* admin-autofill.jsx — bulk "fetch parish photos from the web" modal. Exports window.AutofillModal */

function AutofillModal({
  parishes,
  onClose
}) {
  const onlyMissingDefault = false;
  const [onlyMissing, setOnlyMissing] = React.useState(onlyMissingDefault);
  const [phase, setPhase] = React.useState("idle"); // idle | running | done
  const [rows, setRows] = React.useState([]);
  const [cursor, setCursor] = React.useState(0);
  const cancelRef = React.useRef(false);
  const targets = React.useMemo(() => (parishes || []).filter(c => onlyMissing ? !c.heroImage : true), [parishes, onlyMissing]);
  const found = rows.filter(r => r.status === "web" || r.status === "archive").length;
  async function run() {
    cancelRef.current = false;
    setPhase("running");
    const init = targets.map(c => ({
      id: c.id,
      name: c.name,
      city: c.city,
      status: "pending",
      url: ""
    }));
    setRows(init);
    for (let i = 0; i < targets.length; i++) {
      if (cancelRef.current) break;
      setCursor(i);
      const c = targets[i];
      let res = null;
      try {
        res = await window.ImageSearch.findImages(c);
      } catch (e) {
        res = null;
      }
      const status = res && res.heroImage ? res.source || "web" : "none";
      if (res && res.heroImage) {
        window.ParishStore.update(c.id, {
          heroImage: res.heroImage,
          images: (res.images || []).slice(0, 5)
        });
      }
      setRows(prev => prev.map((r, j) => j === i ? {
        ...r,
        status,
        url: res ? res.heroImage : ""
      } : r));
      // gentle pacing so we don't hammer the API
      await new Promise(r => setTimeout(r, 140));
    }
    setCursor(targets.length);
    setPhase("done");
  }
  function stop() {
    cancelRef.current = true;
  }
  const pct = targets.length ? Math.round(Math.min(cursor, targets.length) / targets.length * 100) : 0;
  const statusMeta = {
    pending: {
      cls: "af-pending",
      label: "…"
    },
    web: {
      cls: "af-ok",
      label: "Found"
    },
    archive: {
      cls: "af-ok",
      label: "Archive"
    },
    none: {
      cls: "af-none",
      label: "None"
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onMouseDown: () => phase !== "running" && onClose(found > 0)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal-autofill",
    onMouseDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "modal-kicker"
  }, "Images"), /*#__PURE__*/React.createElement("h2", null, "Auto-fill photos from the web")), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    onClick: () => phase !== "running" && onClose(found > 0),
    "aria-label": "Close",
    disabled: phase === "running"
  }, /*#__PURE__*/React.createElement(window.I.cross, {
    style: {
      width: 18,
      height: 18,
      transform: "rotate(45deg)"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, phase === "idle" && /*#__PURE__*/React.createElement("div", {
    className: "af-intro"
  }, /*#__PURE__*/React.createElement("p", {
    className: "af-lead"
  }, "Photos are retrieved from ", /*#__PURE__*/React.createElement("b", null, "Wikimedia Commons"), " — a free, openly-licensed media archive — matched to each parish by name and town. Flagship cathedrals use hand-picked archive photos; the rest are searched live."), /*#__PURE__*/React.createElement("label", {
    className: "af-toggle"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: onlyMissing,
    onChange: e => setOnlyMissing(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", null, "Only parishes without a photo ", /*#__PURE__*/React.createElement("em", null, "(", (parishes || []).filter(c => !c.heroImage).length, ")"))), /*#__PURE__*/React.createElement("div", {
    className: "af-count-note"
  }, "Will search ", /*#__PURE__*/React.createElement("b", null, targets.length), " ", targets.length === 1 ? "parish" : "parishes", ". Existing photos ", onlyMissing ? "are kept" : "may be replaced", "."), /*#__PURE__*/React.createElement("div", {
    className: "af-disclaimer"
  }, /*#__PURE__*/React.createElement(window.I.warn, {
    style: {
      width: 14,
      height: 14
    }
  }), " Live web results vary — not every parish has a photo on Commons, and matches are best-effort. Review and adjust in each parish’s editor.")), phase !== "idle" && /*#__PURE__*/React.createElement("div", {
    className: "af-progress-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "af-progress-top"
  }, /*#__PURE__*/React.createElement("span", null, phase === "done" ? "Complete" : "Fetching photos…"), /*#__PURE__*/React.createElement("span", {
    className: "af-progress-num"
  }, Math.min(cursor, targets.length), " / ", targets.length)), /*#__PURE__*/React.createElement("div", {
    className: "af-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "af-bar-fill",
    style: {
      width: pct + "%"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "af-summary"
  }, /*#__PURE__*/React.createElement("span", {
    className: "af-chip af-ok"
  }, /*#__PURE__*/React.createElement(window.I.check, {
    style: {
      width: 13,
      height: 13
    }
  }), " ", found, " found"), /*#__PURE__*/React.createElement("span", {
    className: "af-chip af-none"
  }, rows.filter(r => r.status === "none").length, " not found")), /*#__PURE__*/React.createElement("div", {
    className: "af-list"
  }, rows.map(r => {
    const m = statusMeta[r.status] || statusMeta.pending;
    return /*#__PURE__*/React.createElement("div", {
      className: "af-row",
      key: r.id
    }, /*#__PURE__*/React.createElement("div", {
      className: "af-thumb"
    }, r.url ? /*#__PURE__*/React.createElement("img", {
      src: r.url,
      alt: "",
      onError: e => {
        e.target.style.visibility = "hidden";
      }
    }) : /*#__PURE__*/React.createElement("span", {
      className: "af-thumb-ph"
    })), /*#__PURE__*/React.createElement("div", {
      className: "af-row-main"
    }, /*#__PURE__*/React.createElement("div", {
      className: "af-row-name"
    }, r.name), /*#__PURE__*/React.createElement("div", {
      className: "af-row-city"
    }, r.city || "—")), /*#__PURE__*/React.createElement("span", {
      className: "af-status " + m.cls
    }, r.status === "pending" && r.id === rows[cursor] ? /*#__PURE__*/React.createElement("span", {
      className: "spinner",
      style: {
        width: 12,
        height: 12
      }
    }) : m.label));
  })))), /*#__PURE__*/React.createElement("div", {
    className: "modal-foot"
  }, phase === "idle" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => onClose(false)
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: run,
    disabled: !targets.length
  }, /*#__PURE__*/React.createElement(window.I.globe, {
    style: {
      width: 16,
      height: 16
    }
  }), " Fetch ", targets.length, " photo", targets.length === 1 ? "" : "s")), phase === "running" && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: stop
  }, "Stop"), phase === "done" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "af-done-note"
  }, /*#__PURE__*/React.createElement(window.I.check, {
    style: {
      width: 15,
      height: 15
    }
  }), " Filled ", found, " of ", targets.length, " parishes."), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => onClose(found > 0)
  }, "Done")))));
}
Object.assign(window, {
  AutofillModal
});