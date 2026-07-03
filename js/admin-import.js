/* compiled from admin-import.jsx — do not edit directly; edit the .jsx source */
/* admin-import.jsx — CSV import modal with validation preview. Exports window.ImportModal */

function ImportModal({
  onClose
}) {
  const [stage, setStage] = React.useState("drop"); // drop | preview | done
  const [fileName, setFileName] = React.useState("");
  const [rows, setRows] = React.useState([]); // [{rec, flags}]
  const [drag, setDrag] = React.useState(false);
  const [importedCount, setImportedCount] = React.useState(0);
  const inputRef = React.useRef(null);
  function ingest(text, name) {
    const objs = window.ParishStore.rowsToObjects(window.ParishStore.parseCSV(text));
    const parsed = objs.map(o => {
      const rec = window.ParishStore.csvRowToRecord(o);
      return {
        rec,
        flags: window.ParishStore.validateRaw(rec)
      };
    }).filter(r => r.rec.name);
    setRows(parsed);
    setFileName(name || "pasted.csv");
    setStage("preview");
  }
  function onFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => ingest(String(e.target.result), file.name);
    reader.readAsText(file);
  }
  function loadSample() {
    fetch("sample/Nairobi Parish Data.csv").then(r => r.text()).then(t => ingest(t, "Nairobi Parish Data.csv")).catch(() => alert("Could not load the bundled sample. Try choosing a file instead."));
  }
  function doImport() {
    const recs = rows.map(r => r.rec);
    const added = window.ParishStore.importRecords(recs);
    setImportedCount(added.length);
    setStage("done");
  }
  const stats = React.useMemo(() => {
    const total = rows.length;
    const withCoords = rows.filter(r => r.rec.coords).length;
    const withContact = rows.filter(r => r.rec.phone || r.rec.email).length;
    const withTimes = rows.filter(r => r.rec.massTimes.length).length;
    return {
      total,
      withCoords,
      withContact,
      withTimes
    };
  }, [rows]);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onMouseDown: () => onClose(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal-import",
    onMouseDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "modal-kicker"
  }, "Bulk import"), /*#__PURE__*/React.createElement("h2", null, "Import parishes from CSV")), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    onClick: () => onClose(false),
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement(window.I.cross, {
    style: {
      width: 18,
      height: 18,
      transform: "rotate(45deg)"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, stage === "drop" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "dropzone" + (drag ? " over" : ""),
    onDragOver: e => {
      e.preventDefault();
      setDrag(true);
    },
    onDragLeave: () => setDrag(false),
    onDrop: e => {
      e.preventDefault();
      setDrag(false);
      onFile(e.dataTransfer.files[0]);
    },
    onClick: () => inputRef.current && inputRef.current.click()
  }, /*#__PURE__*/React.createElement("div", {
    className: "dz-icon"
  }, /*#__PURE__*/React.createElement(window.I.upload, {
    style: {
      width: 26,
      height: 26
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "dz-title"
  }, "Drag & drop a CSV file here"), /*#__PURE__*/React.createElement("div", {
    className: "dz-sub"
  }, "or ", /*#__PURE__*/React.createElement("span", {
    className: "link"
  }, "browse to choose a file")), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    type: "file",
    accept: ".csv,text/csv",
    hidden: true,
    onChange: e => onFile(e.target.files[0])
  })), /*#__PURE__*/React.createElement("div", {
    className: "import-help"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ih-row"
  }, /*#__PURE__*/React.createElement(window.I.file, {
    style: {
      width: 15,
      height: 15,
      color: "var(--primary)"
    }
  }), " Expected columns: ", /*#__PURE__*/React.createElement("b", null, "Name, Area, Deanery, Diocese, Coordinates, Telephone, email, Website, Sunday, Weekdays, Confession, Parish Priest…")), /*#__PURE__*/React.createElement("div", {
    className: "ih-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-soft btn-sm",
    onClick: loadSample
  }, /*#__PURE__*/React.createElement(window.I.download, {
    style: {
      width: 15,
      height: 15
    }
  }), " Use bundled sample (Nairobi, 117 parishes)")))), stage === "preview" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "preview-summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ps-file"
  }, /*#__PURE__*/React.createElement(window.I.file, {
    style: {
      width: 16,
      height: 16
    }
  }), " ", fileName), /*#__PURE__*/React.createElement("div", {
    className: "ps-stats"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ps-stat ok"
  }, /*#__PURE__*/React.createElement("b", null, stats.total), " parishes"), /*#__PURE__*/React.createElement("span", {
    className: "ps-stat"
  }, /*#__PURE__*/React.createElement("b", null, stats.withCoords), " with map location"), /*#__PURE__*/React.createElement("span", {
    className: "ps-stat"
  }, /*#__PURE__*/React.createElement("b", null, stats.withContact), " with contact"), /*#__PURE__*/React.createElement("span", {
    className: "ps-stat"
  }, /*#__PURE__*/React.createElement("b", null, stats.withTimes), " with Mass times"))), /*#__PURE__*/React.createElement("div", {
    className: "preview-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "preview-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Parish"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Area"), /*#__PURE__*/React.createElement("th", null, "Diocese"), /*#__PURE__*/React.createElement("th", null, "Map"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "pt-name"
  }, r.rec.name), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "mini-chip"
  }, r.rec.type)), /*#__PURE__*/React.createElement("td", null, r.rec.city || "—"), /*#__PURE__*/React.createElement("td", {
    className: "pt-dim"
  }, r.rec.diocese), /*#__PURE__*/React.createElement("td", null, r.rec.coords ? /*#__PURE__*/React.createElement("span", {
    className: "dot-ok",
    title: "Has coordinates"
  }) : /*#__PURE__*/React.createElement("span", {
    className: "dot-no",
    title: "No coordinates"
  })), /*#__PURE__*/React.createElement("td", null, r.flags.length === 0 ? /*#__PURE__*/React.createElement("span", {
    className: "flag-ok"
  }, /*#__PURE__*/React.createElement(window.I.check, {
    style: {
      width: 13,
      height: 13
    }
  }), " Complete") : /*#__PURE__*/React.createElement("span", {
    className: "flag-warn"
  }, /*#__PURE__*/React.createElement(window.I.warn, {
    style: {
      width: 13,
      height: 13
    }
  }), " ", r.flags.map(f => f.msg).join(", ")))))))), /*#__PURE__*/React.createElement("div", {
    className: "preview-note"
  }, /*#__PURE__*/React.createElement(window.I.warn, {
    style: {
      width: 14,
      height: 14
    }
  }), " Rows with warnings will still import — you can fill in missing details afterwards by editing each parish.")), stage === "done" && /*#__PURE__*/React.createElement("div", {
    className: "import-done"
  }, /*#__PURE__*/React.createElement("div", {
    className: "done-check"
  }, /*#__PURE__*/React.createElement(window.I.check, {
    style: {
      width: 34,
      height: 34
    }
  })), /*#__PURE__*/React.createElement("h3", null, importedCount, " parishes imported"), /*#__PURE__*/React.createElement("p", {
    className: "muted"
  }, "They're now live across the directory, map and dioceses views. Parishes missing coordinates won't appear on the map until you add them."))), /*#__PURE__*/React.createElement("div", {
    className: "modal-foot"
  }, stage === "drop" && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => onClose(false)
  }, "Cancel"), stage === "preview" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => setStage("drop")
  }, /*#__PURE__*/React.createElement(window.I.back, {
    style: {
      width: 15,
      height: 15
    }
  }), " Choose another file"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: doImport
  }, /*#__PURE__*/React.createElement(window.I.upload, {
    style: {
      width: 16,
      height: 16
    }
  }), " Import ", rows.length, " parishes")), stage === "done" && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => onClose(true)
  }, "Done"))));
}
Object.assign(window, {
  ImportModal
});