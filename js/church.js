/* compiled from church.jsx — do not edit directly; edit the .jsx source */
/* church.jsx — individual parish page (shared via window) */

function InfoCard({
  label,
  icon,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "info-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ic-label"
  }, icon, " ", label), children);
}
function ContactRow({
  icon,
  k,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "contact-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ci"
  }, icon), /*#__PURE__*/React.createElement("div", {
    className: "cv"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, k), children));
}

/* image frame: click-to-replace for admins (uploads to secure storage and
   saves to the parish record), static image/placeholder for visitors. */
function Frame({
  church,
  target,
  src,
  label,
  className,
  admin
}) {
  const [busy, setBusy] = React.useState(false);
  function replace() {
    if (!admin || busy) return;
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";
    inp.onchange = function () {
      const file = inp.files && inp.files[0];
      if (!file) return;
      setBusy(true);
      window.uploadParishImage(file, church.id).then(url => {
        const patch = {};
        if (target && target.kind === "hero") {
          patch.heroImage = url;
        } else if (target && target.kind === "image") {
          const imgs = (church.images || []).slice();
          imgs[target.idx] = url;
          patch.images = imgs;
        }
        window.ParishStore.update(church.id, patch);
        setBusy(false);
      }).catch(e => {
        setBusy(false);
        alert("Upload failed: " + (e.message || e));
      });
    };
    inp.click();
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "slot-wrap " + (className || "") + (admin ? " frame-editable" : ""),
    onClick: admin ? replace : undefined,
    title: admin ? "Click to replace this image" : undefined
  }, src ? /*#__PURE__*/React.createElement("img", {
    className: "frame-img",
    src: src,
    alt: label || "",
    loading: "lazy"
  }) : /*#__PURE__*/React.createElement(window.PH, {
    label: label
  }), admin && /*#__PURE__*/React.createElement("div", {
    className: "frame-edit-badge"
  }, busy ? /*#__PURE__*/React.createElement("span", {
    className: "spinner"
  }) : /*#__PURE__*/React.createElement(window.I.upload, {
    style: {
      width: 14,
      height: 14
    }
  }), /*#__PURE__*/React.createElement("span", null, busy ? "Uploading…" : "Replace")));
}
function ChurchPage({
  church: c,
  navigate,
  admin
}) {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [c.id]);
  const hasCoords = c.coords && typeof c.coords.lat === "number";
  const dirUrl = hasCoords ? `https://www.google.com/maps/dir/?api=1&destination=${c.coords.lat},${c.coords.lng}` : null;
  const mapsUrl = hasCoords ? `https://www.openstreetmap.org/?mlat=${c.coords.lat}&mlon=${c.coords.lng}#map=16/${c.coords.lat}/${c.coords.lng}` : null;
  const ct = c.contact || {};
  const hasContact = ct.phone || ct.email || ct.website || c.address || c.poBox;
  const clergyList = [].concat(c.priest ? [c.priest] : [], c.clergy || []);
  const subBits = [];
  if (c.city || c.county) subBits.push(/*#__PURE__*/React.createElement("span", {
    key: "loc"
  }, /*#__PURE__*/React.createElement(window.I.pin, null), " ", [c.city, c.county].filter(Boolean).join(", ")));
  subBits.push(/*#__PURE__*/React.createElement("span", {
    key: "dio"
  }, /*#__PURE__*/React.createElement(window.I.cross, {
    style: {
      width: 14,
      height: 14
    }
  }), " ", c.diocese));
  if (c.deanery) subBits.push(/*#__PURE__*/React.createElement("span", {
    key: "dean"
  }, c.deanery, " Deanery"));
  if (c.founded) subBits.push(/*#__PURE__*/React.createElement("span", {
    key: "est"
  }, "Est. ", c.founded));
  let si = 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "cp"
  }, /*#__PURE__*/React.createElement("a", {
    className: "cp-back",
    onClick: () => navigate(null)
  }, /*#__PURE__*/React.createElement(window.I.back, null), " All parishes"), /*#__PURE__*/React.createElement("div", {
    className: "cp-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cp-hero-main"
  }, /*#__PURE__*/React.createElement(Frame, {
    church: c,
    target: {
      kind: "hero"
    },
    src: c.heroImage || c.images[0],
    label: c.gallery[0],
    className: "hero-slot",
    admin: admin
  }), /*#__PURE__*/React.createElement("div", {
    className: "cp-hero-overlay"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip chip-type"
  }, c.type), /*#__PURE__*/React.createElement("h1", null, c.name), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, subBits))), /*#__PURE__*/React.createElement("div", {
    className: "cp-hero-side"
  }, /*#__PURE__*/React.createElement(Frame, {
    church: c,
    target: {
      kind: "image",
      idx: 1
    },
    src: c.images[1],
    label: c.gallery[1],
    admin: admin
  }), /*#__PURE__*/React.createElement(Frame, {
    church: c,
    target: {
      kind: "image",
      idx: 2
    },
    src: c.images[2],
    label: c.gallery[2],
    admin: admin
  }))), /*#__PURE__*/React.createElement("div", {
    className: "cp-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cp-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section",
    style: {
      "--i": si++
    }
  }, /*#__PURE__*/React.createElement("h2", {
    "data-ek": "parish.s.about"
  }, "About this parish"), /*#__PURE__*/React.createElement("p", {
    className: "lede",
    style: {
      marginTop: 14
    }
  }, c.description)), /*#__PURE__*/React.createElement("div", {
    className: "section",
    style: {
      "--i": si++
    }
  }, /*#__PURE__*/React.createElement("h2", {
    "data-ek": "parish.s.mass"
  }, "Mass & service times"), c.confessions && /*#__PURE__*/React.createElement("div", {
    className: "sec-sub"
  }, "Confessions: ", c.confessions, c.adoration ? " · Adoration: " + c.adoration : ""), c.massTimes.length ? /*#__PURE__*/React.createElement("div", {
    className: "mass-table"
  }, c.massTimes.map((m, i) => /*#__PURE__*/React.createElement("div", {
    className: "mass-row",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "m-day"
  }, m.day), /*#__PURE__*/React.createElement("div", {
    className: "m-time"
  }, m.time), /*#__PURE__*/React.createElement("div", null, m.language ? /*#__PURE__*/React.createElement("span", {
    className: "chip chip-lang"
  }, m.language) : null)))) : /*#__PURE__*/React.createElement("div", {
    className: "empty",
    style: {
      textAlign: "left",
      padding: "20px 22px"
    }
  }, "Mass schedule not yet listed for this parish. ", /*#__PURE__*/React.createElement("a", {
    style: {
      color: "var(--primary)",
      fontWeight: 600,
      cursor: "pointer"
    },
    onClick: () => {
      window.__ecclesiaEdit = c.id;
      navigate("admin");
    }
  }, "Add times in Admin →"))), (c.sacraments.length > 0 || c.services.length > 0) && /*#__PURE__*/React.createElement("div", {
    className: "section",
    style: {
      "--i": si++
    }
  }, /*#__PURE__*/React.createElement("h2", {
    "data-ek": "parish.s.sacraments"
  }, "Sacraments & services"), /*#__PURE__*/React.createElement("div", {
    className: "sec-sub"
  }, "Celebrated and offered at ", c.name, "."), /*#__PURE__*/React.createElement("div", {
    className: "info-grid"
  }, c.sacraments.length > 0 && /*#__PURE__*/React.createElement(InfoCard, {
    label: "Sacraments",
    icon: /*#__PURE__*/React.createElement(window.I.cross, {
      style: {
        width: 14,
        height: 14
      }
    })
  }, /*#__PURE__*/React.createElement("div", {
    className: "tag-wrap",
    style: {
      marginTop: 2
    }
  }, c.sacraments.map(s => /*#__PURE__*/React.createElement("span", {
    key: s,
    className: "chip"
  }, /*#__PURE__*/React.createElement(window.I.check, {
    style: {
      color: "var(--primary)"
    }
  }), " ", s)))), c.services.length > 0 && /*#__PURE__*/React.createElement(InfoCard, {
    label: "Ministries & groups",
    icon: /*#__PURE__*/React.createElement(window.I.people, null)
  }, /*#__PURE__*/React.createElement("div", {
    className: "tag-wrap",
    style: {
      marginTop: 2
    }
  }, c.services.map(s => /*#__PURE__*/React.createElement("span", {
    key: s,
    className: "chip chip-primary"
  }, s)))))), /*#__PURE__*/React.createElement("div", {
    className: "section",
    style: {
      "--i": si++
    }
  }, /*#__PURE__*/React.createElement("h2", {
    "data-ek": "parish.s.gallery"
  }, "Photo gallery"), /*#__PURE__*/React.createElement("div", {
    className: "sec-sub",
    "data-ek": "parish.s.gallery_caption"
  }, "Images of the parish."), admin && /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 12.5,
      marginTop: -4,
      marginBottom: 10
    }
  }, "Tip: click any frame below to upload a photo, or manage image links in the parish editor."), /*#__PURE__*/React.createElement("div", {
    className: "gallery"
  }, /*#__PURE__*/React.createElement(Frame, {
    church: c,
    target: {
      kind: "image",
      idx: 0
    },
    src: c.images[0] || c.heroImage,
    label: c.gallery[0],
    className: "wide",
    admin: admin
  }), /*#__PURE__*/React.createElement(Frame, {
    church: c,
    target: {
      kind: "image",
      idx: 1
    },
    src: c.images[1],
    label: c.gallery[1],
    admin: admin
  }), /*#__PURE__*/React.createElement(Frame, {
    church: c,
    target: {
      kind: "image",
      idx: 2
    },
    src: c.images[2],
    label: c.gallery[2],
    admin: admin
  }), /*#__PURE__*/React.createElement(Frame, {
    church: c,
    target: {
      kind: "image",
      idx: 3
    },
    src: c.images[3],
    label: c.gallery[3],
    admin: admin
  }), /*#__PURE__*/React.createElement(Frame, {
    church: c,
    target: {
      kind: "image",
      idx: 4
    },
    src: c.images[4],
    label: c.gallery[0] + " · detail",
    admin: admin
  }), /*#__PURE__*/React.createElement(Frame, {
    church: c,
    target: {
      kind: "image",
      idx: 5
    },
    src: c.images[5],
    label: c.gallery[3] + " · detail",
    className: "wide",
    admin: admin
  }))), clergyList.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "section",
    style: {
      "--i": si++
    }
  }, /*#__PURE__*/React.createElement("h2", {
    "data-ek": "parish.s.clergy"
  }, "Clergy"), /*#__PURE__*/React.createElement("div", {
    className: "sec-sub"
  }, "Serving the parish community."), /*#__PURE__*/React.createElement("div", null, clergyList.map((p, i) => /*#__PURE__*/React.createElement("div", {
    className: "clergy-row",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "clergy-av"
  }, window.initials(p.name)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "cn"
  }, p.name), /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, p.title)))))), c.events.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "section",
    style: {
      "--i": si++,
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    "data-ek": "parish.s.events"
  }, "Upcoming events"), /*#__PURE__*/React.createElement("div", {
    className: "sec-sub"
  }, "Parish calendar highlights."), /*#__PURE__*/React.createElement("div", null, c.events.map((e, i) => {
    const [mo, day] = (e.date || "").split(" ");
    return /*#__PURE__*/React.createElement("div", {
      className: "event-row",
      key: i
    }, /*#__PURE__*/React.createElement("div", {
      className: "event-date"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ed-mo"
    }, mo), /*#__PURE__*/React.createElement("div", {
      className: "ed-day"
    }, day)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ev-title"
    }, e.title), /*#__PURE__*/React.createElement("div", {
      className: "ev-time"
    }, /*#__PURE__*/React.createElement(window.I.clock, {
      style: {
        width: 13,
        height: 13,
        verticalAlign: "-2px",
        marginRight: 4
      }
    }), e.time)));
  })))), /*#__PURE__*/React.createElement("aside", {
    className: "cp-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "side-card"
  }, /*#__PURE__*/React.createElement("h3", {
    "data-ek": "parish.s.contact"
  }, "Contact"), hasContact ? /*#__PURE__*/React.createElement(React.Fragment, null, ct.phone && /*#__PURE__*/React.createElement(ContactRow, {
    icon: /*#__PURE__*/React.createElement(window.I.phone, null),
    k: "Phone"
  }, /*#__PURE__*/React.createElement("a", {
    className: "v",
    href: "tel:" + ct.phone.replace(/\s/g, "")
  }, ct.phone)), ct.email && /*#__PURE__*/React.createElement(ContactRow, {
    icon: /*#__PURE__*/React.createElement(window.I.mail, null),
    k: "Email"
  }, /*#__PURE__*/React.createElement("a", {
    className: "v",
    href: "mailto:" + ct.email
  }, ct.email)), ct.website && /*#__PURE__*/React.createElement(ContactRow, {
    icon: /*#__PURE__*/React.createElement(window.I.globe, null),
    k: "Website"
  }, /*#__PURE__*/React.createElement("a", {
    className: "v",
    href: (/^https?:/.test(ct.website) ? "" : "https://") + ct.website,
    target: "_blank",
    rel: "noreferrer"
  }, ct.website.replace(/^https?:\/\//, ""))), (c.address || c.poBox) && /*#__PURE__*/React.createElement(ContactRow, {
    icon: /*#__PURE__*/React.createElement(window.I.pin, null),
    k: "Address"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v",
    style: {
      fontWeight: 500
    }
  }, c.address || "P.O. Box " + c.poBox))) : /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 13.5
    }
  }, "No contact details on file yet."), /*#__PURE__*/React.createElement("div", {
    className: "side-actions"
  }, dirUrl ? /*#__PURE__*/React.createElement("a", {
    className: "btn btn-primary",
    href: dirUrl,
    target: "_blank",
    rel: "noreferrer"
  }, /*#__PURE__*/React.createElement(window.I.route, null), " Get directions") : /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    disabled: true,
    style: {
      opacity: .55,
      cursor: "default"
    }
  }, /*#__PURE__*/React.createElement(window.I.pin, null), " Location not set"), mapsUrl && /*#__PURE__*/React.createElement("a", {
    className: "btn btn-ghost",
    href: mapsUrl,
    target: "_blank",
    rel: "noreferrer"
  }, /*#__PURE__*/React.createElement(window.I.pin, null), " View on map"))), /*#__PURE__*/React.createElement("div", {
    className: "side-card"
  }, /*#__PURE__*/React.createElement("h3", {
    "data-ek": "parish.s.office"
  }, "Office hours"), c.officeHours.length ? c.officeHours.map((o, i) => /*#__PURE__*/React.createElement("div", {
    className: "ic-row",
    key: i,
    style: {
      padding: "7px 0",
      borderBottom: i < c.officeHours.length - 1 ? "1px solid var(--line)" : "none",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--ink-2)",
      flex: "none"
    }
  }, o.days), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      textAlign: "right"
    }
  }, o.hours))) : /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 13.5
    }
  }, "Contact the parish office for hours.")), hasCoords && /*#__PURE__*/React.createElement("div", {
    className: "side-card"
  }, /*#__PURE__*/React.createElement("h3", {
    "data-ek": "parish.s.location"
  }, "Location"), /*#__PURE__*/React.createElement("div", {
    className: "side-map"
  }, /*#__PURE__*/React.createElement(window.MiniMap, {
    church: c
  })), /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 12.5,
      marginTop: 10
    }
  }, c.diocese)))));
}
Object.assign(window, {
  ChurchPage
});