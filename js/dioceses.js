/* compiled from dioceses.jsx — do not edit directly; edit the .jsx source */
/* dioceses.jsx — browse parishes grouped by diocese (shared via window) */

function DioParishCard({
  c,
  navigate
}) {
  const s = window.nextSunday(c.massTimes);
  return /*#__PURE__*/React.createElement("div", {
    className: "dio-card",
    onClick: () => navigate(c.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "dio-card-thumb"
  }, /*#__PURE__*/React.createElement(window.Thumb, {
    src: c.heroImage || c.images[0],
    label: c.gallery[0]
  })), /*#__PURE__*/React.createElement("div", {
    className: "dio-card-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dio-card-type"
  }, c.type), /*#__PURE__*/React.createElement("div", {
    className: "dio-card-name"
  }, c.name), /*#__PURE__*/React.createElement("div", {
    className: "dio-card-meta"
  }, /*#__PURE__*/React.createElement(window.I.pin, {
    style: {
      width: 12,
      height: 12
    }
  }), " ", c.city || c.county || "—"), s && /*#__PURE__*/React.createElement("div", {
    className: "dio-card-meta"
  }, /*#__PURE__*/React.createElement(window.I.clock, {
    style: {
      width: 12,
      height: 12,
      color: "var(--primary)"
    }
  }), " ", s.day === "Sunday" ? "Sun" : s.day, " ", s.time, s.language ? " · " + s.language : "")), /*#__PURE__*/React.createElement("span", {
    className: "dio-card-go"
  }, /*#__PURE__*/React.createElement(window.I.chev, {
    style: {
      transform: "rotate(-90deg)"
    }
  })));
}
function DiocesesView({
  navigate,
  parishes
}) {
  const all = parishes || window.ParishStore.getAll();
  const groups = React.useMemo(() => {
    const map = {};
    all.forEach(c => {
      (map[c.diocese] = map[c.diocese] || []).push(c);
    });
    return Object.entries(map).map(([name, churches]) => {
      const seat = churches.find(c => /Cathedral|Basilica/i.test(c.type)) || churches[0];
      const counties = window.uniqueSorted(churches.map(c => c.county).filter(Boolean));
      return {
        name,
        churches,
        seat,
        counties,
        isArch: /^Archdiocese/i.test(name)
      };
    }).sort((a, b) => a.isArch === b.isArch ? a.name.localeCompare(b.name) : a.isArch ? -1 : 1);
  }, [all]);
  const counties = window.uniqueSorted(all.map(c => c.county).filter(Boolean)).length;
  return /*#__PURE__*/React.createElement("div", {
    className: "dio-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dir-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Ecclesiastical map · Kenya"), /*#__PURE__*/React.createElement("h1", {
    className: "serif"
  }, "Browse by diocese."), /*#__PURE__*/React.createElement("p", null, "The Catholic Church in Kenya is organised into archdioceses and dioceses, each led by a bishop from its cathedral. Explore the parishes within each jurisdiction below.")), /*#__PURE__*/React.createElement("div", {
    className: "dio-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dio-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-num"
  }, groups.length), /*#__PURE__*/React.createElement("div", {
    className: "ds-lbl"
  }, "Dioceses & archdioceses")), /*#__PURE__*/React.createElement("div", {
    className: "dio-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-num"
  }, all.length), /*#__PURE__*/React.createElement("div", {
    className: "ds-lbl"
  }, "Parishes listed")), /*#__PURE__*/React.createElement("div", {
    className: "dio-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-num"
  }, counties), /*#__PURE__*/React.createElement("div", {
    className: "ds-lbl"
  }, "Counties covered")), /*#__PURE__*/React.createElement("div", {
    className: "dio-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-num"
  }, groups.filter(g => g.isArch).length), /*#__PURE__*/React.createElement("div", {
    className: "ds-lbl"
  }, "Archdioceses"))), /*#__PURE__*/React.createElement("div", {
    className: "dio-wrap"
  }, groups.map((g, gi) => /*#__PURE__*/React.createElement("section", {
    className: "dio-group",
    key: g.name,
    style: {
      "--i": gi
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dio-group-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dgh-kicker"
  }, g.isArch ? "Archdiocese" : "Diocese"), /*#__PURE__*/React.createElement("h2", null, g.name.replace(/^(Arch)?diocese of /i, "")), /*#__PURE__*/React.createElement("div", {
    className: "dgh-sub"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(window.I.cross, {
    style: {
      width: 13,
      height: 13
    }
  }), " Seat: ", g.seat.name, g.seat.city ? ", " + g.seat.city : ""), g.counties.length > 0 && /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(window.I.pin, {
    style: {
      width: 13,
      height: 13
    }
  }), " ", g.counties.join(", "), " County"))), /*#__PURE__*/React.createElement("div", {
    className: "dgh-count"
  }, g.churches.length, " ", /*#__PURE__*/React.createElement("span", null, g.churches.length === 1 ? "parish" : "parishes"))), /*#__PURE__*/React.createElement("div", {
    className: "dio-grid"
  }, g.churches.map(c => /*#__PURE__*/React.createElement(DioParishCard, {
    key: c.id,
    c: c,
    navigate: navigate
  })))))));
}
Object.assign(window, {
  DiocesesView
});