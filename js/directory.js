/* compiled from directory.jsx — do not edit directly; edit the .jsx source */
/* directory.jsx — homepage: hero, filters, church list + map (shared via window) */

/* highlight matched substring within text */
function highlight(text, q) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return [text.slice(0, i), /*#__PURE__*/React.createElement("mark", {
    key: "m"
  }, text.slice(i, i + q.length)), text.slice(i + q.length)];
}

/* ---------- Live (AJAX-style) typeahead search ---------- */
function LiveSearch({
  all,
  query,
  setQuery,
  onPick
}) {
  const [focused, setFocused] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState([]);
  const [kbd, setKbd] = React.useState(0);
  const timer = React.useRef(null);
  const q = query.trim();

  // simulate an async fetch: debounce + latency + loading state
  React.useEffect(() => {
    if (!q) {
      setResults([]);
      setLoading(false);
      clearTimeout(timer.current);
      return;
    }
    setLoading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const ql = q.toLowerCase();
      const matches = all.map(c => {
        const hay = (c.name + " " + c.city + " " + c.diocese + " " + c.county + " " + c.patron).toLowerCase();
        const idx = hay.indexOf(ql);
        return idx < 0 ? null : {
          c,
          score: c.name.toLowerCase().indexOf(ql) >= 0 ? idx : idx + 100
        };
      }).filter(Boolean).sort((a, b) => a.score - b.score).slice(0, 6).map(x => x.c);
      setResults(matches);
      setKbd(0);
      setLoading(false);
    }, 260 + Math.random() * 160);
    return () => clearTimeout(timer.current);
  }, [q, all]);
  const open = focused && q.length > 0;
  function onKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setKbd(k => Math.min(k + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setKbd(k => Math.max(k - 1, 0));
    } else if (e.key === "Enter") {
      if (results[kbd]) {
        e.preventDefault();
        onPick(results[kbd].id);
      }
    } else if (e.key === "Escape") {
      e.target.blur();
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "search"
  }, /*#__PURE__*/React.createElement("span", {
    className: "s-icon"
  }, /*#__PURE__*/React.createElement(window.I.search, null)), /*#__PURE__*/React.createElement("input", {
    className: query ? "has-clear" : "",
    value: query,
    onChange: e => setQuery(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setTimeout(() => setFocused(false), 130),
    onKeyDown: onKeyDown,
    placeholder: "Search by parish, town or diocese…"
  }), loading && /*#__PURE__*/React.createElement("span", {
    className: "s-spin"
  }, /*#__PURE__*/React.createElement("span", {
    className: "spinner"
  })), !loading && query && /*#__PURE__*/React.createElement("button", {
    className: "s-clear",
    onMouseDown: e => {
      e.preventDefault();
      setQuery("");
    },
    "aria-label": "Clear"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6L6 18"
  }))), open && /*#__PURE__*/React.createElement("div", {
    className: "search-dropdown"
  }, loading ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sd-head"
  }, /*#__PURE__*/React.createElement("span", null, "Searching…")), [0, 1, 2].map(i => /*#__PURE__*/React.createElement("div", {
    className: "sd-row",
    key: i,
    style: {
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sd-ic skel"
  }), /*#__PURE__*/React.createElement("div", {
    className: "sd-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "skel",
    style: {
      height: 13,
      width: "62%",
      marginBottom: 7
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "skel",
    style: {
      height: 10,
      width: "40%"
    }
  }))))) : results.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "sd-empty"
  }, "No parishes match “", /*#__PURE__*/React.createElement("b", null, q), "”.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sd-head"
  }, /*#__PURE__*/React.createElement("span", null, "Parishes"), /*#__PURE__*/React.createElement("span", null, results.length, " ", results.length === 1 ? "result" : "results")), results.map((c, i) => {
    const s = window.nextSunday(c.massTimes);
    return /*#__PURE__*/React.createElement("div", {
      key: c.id,
      className: "sd-row " + (i === kbd ? "kbd" : ""),
      style: {
        animationDelay: i * 32 + "ms"
      },
      onMouseEnter: () => setKbd(i),
      onMouseDown: e => {
        e.preventDefault();
        onPick(c.id);
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "sd-ic"
    }, /*#__PURE__*/React.createElement(window.Thumb, {
      src: c.heroImage || c.images[0],
      label: c.type
    })), /*#__PURE__*/React.createElement("div", {
      className: "sd-main"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sd-name"
    }, highlight(c.name, q)), /*#__PURE__*/React.createElement("div", {
      className: "sd-meta"
    }, /*#__PURE__*/React.createElement(window.I.pin, {
      style: {
        width: 13,
        height: 13
      }
    }), " ", [c.city, c.diocese].filter(Boolean).join(" · "), s ? " · Sun " + s.time : "")), /*#__PURE__*/React.createElement("span", {
      className: "sd-go"
    }, /*#__PURE__*/React.createElement(window.I.chev, {
      style: {
        transform: "rotate(-90deg)"
      }
    })));
  }), /*#__PURE__*/React.createElement("div", {
    className: "sd-foot"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("kbd", null, "↑"), /*#__PURE__*/React.createElement("kbd", null, "↓"), " navigate"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("kbd", null, "↵"), " open parish"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("kbd", null, "esc"), " close")))));
}
function ChurchCard({
  c,
  active,
  onHover,
  onSelect,
  onOpen,
  dist,
  cardStyle,
  index
}) {
  const s = window.nextSunday(c.massTimes);
  const langs = window.uniqueSorted(c.massTimes.map(m => m.language).filter(Boolean)).slice(0, 3);
  return /*#__PURE__*/React.createElement("div", {
    className: "ch-card " + (active ? "active " : "") + (cardStyle === "soft" ? "softshadow" : ""),
    style: {
      "--i": index
    },
    onMouseEnter: () => onHover(c.id),
    onClick: () => onOpen(c.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "ch-thumb"
  }, /*#__PURE__*/React.createElement(window.Thumb, {
    src: c.heroImage || c.images[0],
    label: c.gallery[0]
  })), /*#__PURE__*/React.createElement("div", {
    className: "ch-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ch-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip chip-type"
  }, c.type), /*#__PURE__*/React.createElement("span", {
    className: "ch-dio"
  }, c.diocese)), /*#__PURE__*/React.createElement("h3", null, c.name), /*#__PURE__*/React.createElement("div", {
    className: "ch-loc"
  }, /*#__PURE__*/React.createElement(window.I.pin, null), " ", c.address || [c.city, c.county].filter(Boolean).join(", ") || "Location to be confirmed"), /*#__PURE__*/React.createElement("div", {
    className: "ch-foot"
  }, s ? /*#__PURE__*/React.createElement("span", {
    className: "ch-next"
  }, /*#__PURE__*/React.createElement(window.I.clock, {
    style: {
      color: "var(--primary)"
    }
  }), " ", s.day === "Sunday" ? "Sun" : s.day, " ", /*#__PURE__*/React.createElement("b", null, s.time)) : /*#__PURE__*/React.createElement("span", {
    className: "ch-next muted",
    style: {
      fontStyle: "italic"
    }
  }, "Schedule not listed"), langs.map(l => /*#__PURE__*/React.createElement("span", {
    key: l,
    className: "chip chip-lang"
  }, l)), dist != null && /*#__PURE__*/React.createElement("span", {
    className: "ch-dist"
  }, dist < 1 ? "<1" : Math.round(dist), " km"))));
}
function DirectoryView({
  navigate,
  tweaks,
  mode,
  parishes
}) {
  const all = parishes || window.ParishStore.getAll();
  const mapMode = mode === "map";
  const [query, setQuery] = React.useState("");
  const [diocese, setDiocese] = React.useState("All");
  const [lang, setLang] = React.useState("All");
  const [nearest, setNearest] = React.useState(false);
  const [userLoc, setUserLoc] = React.useState(null);
  const [activeId, setActiveId] = React.useState(null);
  const [geoState, setGeoState] = React.useState("idle");
  const dioceses = React.useMemo(() => ["All", ...window.uniqueSorted(all.map(c => c.diocese))], [all]);
  const languages = React.useMemo(() => ["All", ...window.uniqueSorted(all.flatMap(c => c.massTimes.map(m => m.language)))], [all]);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = all.filter(c => {
      if (diocese !== "All" && c.diocese !== diocese) return false;
      if (lang !== "All" && !c.massTimes.some(m => m.language === lang)) return false;
      if (q) {
        const hay = (c.name + " " + c.city + " " + c.diocese + " " + c.county + " " + c.patron).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (nearest && userLoc) {
      list = list.map(c => ({
        c,
        d: c.coords ? window.haversine(userLoc, c.coords) : Infinity
      })).sort((a, b) => a.d - b.d).map(x => x.c);
    }
    return list;
  }, [all, query, diocese, lang, nearest, userLoc]);
  const distOf = c => userLoc && c.coords ? window.haversine(userLoc, c.coords) : null;
  function findNearest() {
    setNearest(true);
    if (userLoc) return;
    setGeoState("locating");
    const fallback = {
      lat: -1.28637,
      lng: 36.81724
    }; // Nairobi CBD
    if (!navigator.geolocation) {
      setUserLoc(fallback);
      setGeoState("fallback");
      return;
    }
    navigator.geolocation.getCurrentPosition(pos => {
      setUserLoc({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
      setGeoState("ok");
    }, () => {
      setUserLoc(fallback);
      setGeoState("fallback");
    }, {
      timeout: 6000
    });
  }
  const layout = mapMode ? "mapfirst" : tweaks.homeLayout || "split";
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dir-hero"
  }, mapMode ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Interactive Map · Kenya"), /*#__PURE__*/React.createElement("h1", {
    className: "serif"
  }, "Explore parishes on the map."), /*#__PURE__*/React.createElement("p", null, "Every parish in the directory, plotted across Kenya. Click a pin for details and Mass times, or filter the set below  the map updates as you search.")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      padding: "0px 0px 5px"
    }
  }, "Catholic Directory · Kenya"), /*#__PURE__*/React.createElement("h1", {
    className: "serif",
    style: {
      padding: "50px 0px 0px"
    }
  }, "Find a Catholic parish anywhere in Kenya."), /*#__PURE__*/React.createElement("p", null, "Browse cathedrals, basilicas and parishes across the dioceses of Kenya  with Mass times, contacts and locations on the map. Search by name, filter by diocese or language, or find the parish nearest you."))), /*#__PURE__*/React.createElement("div", {
    className: "toolbar"
  }, /*#__PURE__*/React.createElement(LiveSearch, {
    all: all,
    query: query,
    setQuery: setQuery,
    onPick: navigate
  }), /*#__PURE__*/React.createElement("div", {
    className: "filter-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "select-wrap"
  }, /*#__PURE__*/React.createElement("select", {
    value: diocese,
    onChange: e => setDiocese(e.target.value)
  }, dioceses.map(d => /*#__PURE__*/React.createElement("option", {
    key: d,
    value: d
  }, d === "All" ? "All dioceses" : d))), /*#__PURE__*/React.createElement("span", {
    className: "chev"
  }, /*#__PURE__*/React.createElement(window.I.chev, null))), /*#__PURE__*/React.createElement("div", {
    className: "select-wrap"
  }, /*#__PURE__*/React.createElement("select", {
    value: lang,
    onChange: e => setLang(e.target.value)
  }, languages.map(l => /*#__PURE__*/React.createElement("option", {
    key: l,
    value: l
  }, l === "All" ? "Any language" : "Mass in " + l))), /*#__PURE__*/React.createElement("span", {
    className: "chev"
  }, /*#__PURE__*/React.createElement(window.I.chev, null))), /*#__PURE__*/React.createElement("button", {
    className: "btn " + (nearest ? "btn-primary" : "btn-ghost"),
    onClick: findNearest
  }, /*#__PURE__*/React.createElement(window.I.loc, null), " ", geoState === "locating" ? "Locating…" : "Nearest to me"))), /*#__PURE__*/React.createElement("div", {
    className: "dir-body " + layout
  }, /*#__PURE__*/React.createElement("div", {
    className: "list-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "list-head"
  }, nearest && userLoc && /*#__PURE__*/React.createElement("div", {
    className: "count",
    style: {
      color: "var(--primary)",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(window.I.route, null), " sorted by distance", geoState === "fallback" ? " from Nairobi" : "")), /*#__PURE__*/React.createElement("div", {
    className: "card-list",
    key: diocese + "|" + lang + "|" + nearest
  }, filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, "No parishes match your search. Try clearing a filter."), filtered.map((c, i) => /*#__PURE__*/React.createElement(ChurchCard, {
    key: c.id,
    c: c,
    active: c.id === activeId,
    index: i,
    onHover: setActiveId,
    onSelect: setActiveId,
    onOpen: navigate,
    dist: nearest ? distOf(c) : null,
    cardStyle: tweaks.cardStyle
  }))), /*#__PURE__*/React.createElement("p", {
    className: "muted",
    style: {
      fontSize: 12.5,
      marginTop: 14
    }
  }, "Tip: hover a parish to locate it on the map · click a card or a map pin’s “View parish” to open its page.")), /*#__PURE__*/React.createElement("div", {
    className: "map-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "map-panel"
  }, /*#__PURE__*/React.createElement(window.DirectoryMap, {
    churches: filtered.filter(c => c.coords),
    activeId: activeId,
    onSelect: setActiveId,
    onOpen: navigate,
    userLoc: userLoc
  })), filtered.some(c => !c.coords) && /*#__PURE__*/React.createElement("div", {
    className: "map-note"
  }, /*#__PURE__*/React.createElement(window.I.pin, {
    style: {
      width: 13,
      height: 13
    }
  }), " ", filtered.filter(c => !c.coords).length, " of ", filtered.length, " parishes have no map location yet — add coordinates in Admin."))));
}
Object.assign(window, {
  DirectoryView
});