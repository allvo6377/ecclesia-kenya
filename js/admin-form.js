/* compiled from admin-form.jsx — do not edit directly; edit the .jsx source */
/* admin-form.jsx — add / edit parish form (modal). Exports window.ParishForm */

const FORM_TYPES = ["Parish Church", "Cathedral", "Minor Basilica", "Shrine", "Chapel"];
const FORM_DAYS = ["Sunday", "Weekdays", "Daily", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Public Holidays"];
const FORM_LANGS = ["", "English", "Swahili", "Kikuyu", "Kimeru", "Kamba", "Kipsigis", "Latin", "Children's"];
function FField({
  label,
  children,
  full,
  hint
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "fld" + (full ? " fld-full" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "fld-label"
  }, label, hint && /*#__PURE__*/React.createElement("em", {
    className: "fld-hint"
  }, hint)), children);
}
function emptyDraft() {
  return {
    name: "",
    type: "Parish Church",
    patron: "",
    diocese: "Archdiocese of Nairobi",
    deanery: "",
    city: "",
    county: "",
    address: "",
    poBox: "",
    lat: "",
    lng: "",
    founded: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    massTimes: [{
      day: "Sunday",
      time: "",
      language: "English"
    }],
    officeHours: [],
    priestName: "",
    clergy: [],
    confessions: "",
    adoration: "",
    heroImage: "",
    images: []
  };
}
function recordToDraft(c) {
  return {
    name: c.name || "",
    type: c.type || "Parish Church",
    patron: c.patron || "",
    diocese: c.diocese || "Archdiocese of Nairobi",
    deanery: c.deanery || "",
    city: c.city || "",
    county: c.county || "",
    address: c.address || "",
    poBox: c.poBox || "",
    lat: c.coords ? String(c.coords.lat) : "",
    lng: c.coords ? String(c.coords.lng) : "",
    founded: c.founded || "",
    description: c.description || "",
    phone: c.contact && c.contact.phone || "",
    email: c.contact && c.contact.email || "",
    website: c.contact && c.contact.website || "",
    massTimes: c.massTimes && c.massTimes.length ? c.massTimes.map(m => ({
      ...m
    })) : [{
      day: "Sunday",
      time: "",
      language: "English"
    }],
    officeHours: (c.officeHours || []).map(o => ({
      ...o
    })),
    priestName: c.priest ? c.priest.name : "",
    clergy: (c.clergy || []).map(p => ({
      ...p
    })),
    confessions: c.confessions || "",
    adoration: c.adoration || "",
    heroImage: c.heroImage || "",
    images: (c.images || []).slice()
  };
}
function ParishForm({
  church,
  allDioceses,
  onClose
}) {
  const editing = !!church;
  const [d, setD] = React.useState(() => church ? recordToDraft(church) : emptyDraft());
  const [err, setErr] = React.useState("");
  const set = (k, v) => setD(p => ({
    ...p,
    [k]: v
  }));

  // dynamic rows
  const addMass = () => set("massTimes", [...d.massTimes, {
    day: "Sunday",
    time: "",
    language: "English"
  }]);
  const setMass = (i, k, v) => set("massTimes", d.massTimes.map((m, j) => j === i ? {
    ...m,
    [k]: v
  } : m));
  const delMass = i => set("massTimes", d.massTimes.filter((_, j) => j !== i));
  const addHours = () => set("officeHours", [...d.officeHours, {
    days: "Mon – Fri",
    hours: ""
  }]);
  const setHours = (i, k, v) => set("officeHours", d.officeHours.map((m, j) => j === i ? {
    ...m,
    [k]: v
  } : m));
  const delHours = i => set("officeHours", d.officeHours.filter((_, j) => j !== i));
  const addClergy = () => set("clergy", [...d.clergy, {
    name: "",
    title: "Assistant Priest"
  }]);
  const setClergy = (i, k, v) => set("clergy", d.clergy.map((m, j) => j === i ? {
    ...m,
    [k]: v
  } : m));
  const delClergy = i => set("clergy", d.clergy.filter((_, j) => j !== i));
  const addImage = () => set("images", [...d.images, ""]);
  const setImage = (i, v) => set("images", d.images.map((m, j) => j === i ? v : m));
  const delImage = i => set("images", d.images.filter((_, j) => j !== i));

  // Upload a file from the admin's computer to secure storage, returning its URL.
  const [uploading, setUploading] = React.useState("");
  function uploadTo(kind, idx) {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";
    inp.onchange = function () {
      const file = inp.files && inp.files[0];
      if (!file) return;
      setUploading(kind === "hero" ? "hero" : "g" + idx);
      window.uploadParishImage(file, church ? church.id : "new").then(url => {
        if (kind === "hero") set("heroImage", url);else if (kind === "add") set("images", [...d.images, url]);else setImage(idx, url);
        setUploading("");
      }).catch(e => {
        setUploading("");
        setErr("Upload failed: " + (e.message || e));
      });
    };
    inp.click();
  }
  const [finding, setFinding] = React.useState(false);
  const [findMsg, setFindMsg] = React.useState("");
  function findOnline() {
    if (!d.name.trim()) {
      setErr("Enter a parish name first, then search for a photo.");
      return;
    }
    setFinding(true);
    setFindMsg("");
    const probe = {
      id: church ? church.id : "",
      name: d.name,
      city: d.city,
      county: d.county,
      type: d.type
    };
    window.ImageSearch.findImages(probe).then(res => {
      setFinding(false);
      if (res && res.heroImage) {
        setD(p => ({
          ...p,
          heroImage: res.heroImage,
          images: (res.images || []).slice(0, 5)
        }));
        setFindMsg(res.source === "archive" ? "Found archive photos for this parish." : "Found " + (res.images ? res.images.length : 1) + " photo(s) from Wikimedia Commons.");
      } else {
        setFindMsg("No photo found online — add a URL or drag one in on the parish page.");
      }
    }).catch(() => {
      setFinding(false);
      setFindMsg("Couldn't reach the image service. Try again or paste a URL.");
    });
  }
  function save() {
    if (!d.name.trim()) {
      setErr("Parish name is required.");
      window.scrollTo(0, 0);
      return;
    }
    let coords = null;
    if (d.lat !== "" && d.lng !== "") {
      const lat = parseFloat(d.lat),
        lng = parseFloat(d.lng);
      if (isNaN(lat) || isNaN(lng)) {
        setErr("Coordinates must be numbers (or leave both blank).");
        return;
      }
      coords = {
        lat,
        lng
      };
    }
    const rec = {
      name: d.name.trim(),
      type: d.type,
      patron: d.patron.trim(),
      diocese: d.diocese,
      deanery: d.deanery.trim(),
      city: d.city.trim(),
      county: d.county.trim(),
      address: d.address.trim(),
      poBox: d.poBox.trim(),
      coords,
      founded: d.founded ? parseInt(d.founded, 10) || d.founded : null,
      description: d.description.trim(),
      contact: {
        phone: d.phone.trim(),
        email: d.email.trim(),
        website: d.website.trim()
      },
      massTimes: d.massTimes.filter(m => m.time.trim()),
      officeHours: d.officeHours.filter(o => o.hours.trim()),
      priest: d.priestName.trim() ? {
        name: d.priestName.trim(),
        title: "Parish Priest"
      } : null,
      clergy: d.clergy.filter(p => p.name.trim()).map(p => ({
        name: p.name.trim(),
        title: p.title || "Assistant Priest"
      })),
      confessions: d.confessions.trim(),
      adoration: d.adoration.trim(),
      heroImage: d.heroImage.trim(),
      images: d.images.map(s => s.trim()).filter(Boolean),
      source: editing ? church.source || "manual" : "manual"
    };
    if (editing) {
      // preserve rich seed fields not in the form
      rec.tagline = church.tagline;
      rec.sacraments = church.sacraments;
      rec.services = church.services;
      rec.gallery = church.gallery;
      rec.events = church.events;
      rec.socials = church.socials;
      window.ParishStore.update(church.id, rec);
    } else {
      window.ParishStore.add(rec);
    }
    onClose(true);
  }
  const dioOptions = window.uniqueSorted([...(allDioceses || []), "Archdiocese of Nairobi", "Archdiocese of Mombasa", "Archdiocese of Kisumu", "Archdiocese of Nyeri", d.diocese].filter(Boolean));
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onMouseDown: () => onClose(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal-form",
    onMouseDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "modal-kicker"
  }, editing ? "Edit parish" : "Add a parish"), /*#__PURE__*/React.createElement("h2", null, editing ? church.name : "New parish record")), /*#__PURE__*/React.createElement("button", {
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
  }, err && /*#__PURE__*/React.createElement("div", {
    className: "form-error"
  }, /*#__PURE__*/React.createElement(window.I.warn, {
    style: {
      width: 15,
      height: 15
    }
  }), " ", err), /*#__PURE__*/React.createElement("div", {
    className: "form-sec"
  }, "Identity"), /*#__PURE__*/React.createElement("div", {
    className: "form-grid"
  }, /*#__PURE__*/React.createElement(FField, {
    label: "Parish name",
    full: true
  }, /*#__PURE__*/React.createElement("input", {
    value: d.name,
    onChange: e => set("name", e.target.value),
    placeholder: "e.g. St. Joseph the Worker"
  })), /*#__PURE__*/React.createElement(FField, {
    label: "Type"
  }, /*#__PURE__*/React.createElement("div", {
    className: "select-wrap full"
  }, /*#__PURE__*/React.createElement("select", {
    value: d.type,
    onChange: e => set("type", e.target.value)
  }, FORM_TYPES.map(x => /*#__PURE__*/React.createElement("option", {
    key: x
  }, x))), /*#__PURE__*/React.createElement("span", {
    className: "chev"
  }, /*#__PURE__*/React.createElement(window.I.chev, null)))), /*#__PURE__*/React.createElement(FField, {
    label: "Patron saint"
  }, /*#__PURE__*/React.createElement("input", {
    value: d.patron,
    onChange: e => set("patron", e.target.value),
    placeholder: "e.g. St. Joseph"
  })), /*#__PURE__*/React.createElement(FField, {
    label: "Year founded",
    hint: "optional"
  }, /*#__PURE__*/React.createElement("input", {
    value: d.founded,
    onChange: e => set("founded", e.target.value),
    placeholder: "e.g. 1955"
  })), /*#__PURE__*/React.createElement(FField, {
    label: "Diocese"
  }, /*#__PURE__*/React.createElement("div", {
    className: "select-wrap full"
  }, /*#__PURE__*/React.createElement("select", {
    value: d.diocese,
    onChange: e => set("diocese", e.target.value)
  }, dioOptions.map(x => /*#__PURE__*/React.createElement("option", {
    key: x
  }, x))), /*#__PURE__*/React.createElement("span", {
    className: "chev"
  }, /*#__PURE__*/React.createElement(window.I.chev, null)))), /*#__PURE__*/React.createElement(FField, {
    label: "Deanery",
    hint: "optional"
  }, /*#__PURE__*/React.createElement("input", {
    value: d.deanery,
    onChange: e => set("deanery", e.target.value),
    placeholder: "e.g. Ruaraka"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "form-sec"
  }, "Location"), /*#__PURE__*/React.createElement("div", {
    className: "form-grid"
  }, /*#__PURE__*/React.createElement(FField, {
    label: "Area / town"
  }, /*#__PURE__*/React.createElement("input", {
    value: d.city,
    onChange: e => set("city", e.target.value),
    placeholder: "e.g. Kangemi"
  })), /*#__PURE__*/React.createElement(FField, {
    label: "County"
  }, /*#__PURE__*/React.createElement("input", {
    value: d.county,
    onChange: e => set("county", e.target.value),
    placeholder: "e.g. Nairobi"
  })), /*#__PURE__*/React.createElement(FField, {
    label: "Physical address",
    full: true
  }, /*#__PURE__*/React.createElement("input", {
    value: d.address,
    onChange: e => set("address", e.target.value),
    placeholder: "Road / building / area"
  })), /*#__PURE__*/React.createElement(FField, {
    label: "P.O. Box",
    hint: "optional"
  }, /*#__PURE__*/React.createElement("input", {
    value: d.poBox,
    onChange: e => set("poBox", e.target.value),
    placeholder: "e.g. 23408, 00625 Kangemi"
  })), /*#__PURE__*/React.createElement(FField, {
    label: "Coordinates",
    hint: "lat, lng — optional"
  }, /*#__PURE__*/React.createElement("div", {
    className: "coord-pair"
  }, /*#__PURE__*/React.createElement("input", {
    value: d.lat,
    onChange: e => set("lat", e.target.value),
    placeholder: "-1.2750"
  }), /*#__PURE__*/React.createElement("input", {
    value: d.lng,
    onChange: e => set("lng", e.target.value),
    placeholder: "36.7403"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "form-sec"
  }, "Contact"), /*#__PURE__*/React.createElement("div", {
    className: "form-grid"
  }, /*#__PURE__*/React.createElement(FField, {
    label: "Telephone"
  }, /*#__PURE__*/React.createElement("input", {
    value: d.phone,
    onChange: e => set("phone", e.target.value),
    placeholder: "+254 7…"
  })), /*#__PURE__*/React.createElement(FField, {
    label: "Email"
  }, /*#__PURE__*/React.createElement("input", {
    value: d.email,
    onChange: e => set("email", e.target.value),
    placeholder: "parish@example.org"
  })), /*#__PURE__*/React.createElement(FField, {
    label: "Website",
    full: true
  }, /*#__PURE__*/React.createElement("input", {
    value: d.website,
    onChange: e => set("website", e.target.value),
    placeholder: "www.parish.org"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "form-sec"
  }, "Mass & service times", /*#__PURE__*/React.createElement("button", {
    className: "add-row",
    onClick: addMass
  }, /*#__PURE__*/React.createElement(window.I.plus, {
    style: {
      width: 14,
      height: 14
    }
  }), " Add time")), /*#__PURE__*/React.createElement("div", {
    className: "row-stack"
  }, d.massTimes.map((m, i) => /*#__PURE__*/React.createElement("div", {
    className: "dyn-row mass",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "select-wrap"
  }, /*#__PURE__*/React.createElement("select", {
    value: m.day,
    onChange: e => setMass(i, "day", e.target.value)
  }, FORM_DAYS.map(x => /*#__PURE__*/React.createElement("option", {
    key: x
  }, x))), /*#__PURE__*/React.createElement("span", {
    className: "chev"
  }, /*#__PURE__*/React.createElement(window.I.chev, null))), /*#__PURE__*/React.createElement("input", {
    value: m.time,
    onChange: e => setMass(i, "time", e.target.value),
    placeholder: "7:00 am"
  }), /*#__PURE__*/React.createElement("div", {
    className: "select-wrap"
  }, /*#__PURE__*/React.createElement("select", {
    value: m.language,
    onChange: e => setMass(i, "language", e.target.value)
  }, FORM_LANGS.map(x => /*#__PURE__*/React.createElement("option", {
    key: x,
    value: x
  }, x || "—"))), /*#__PURE__*/React.createElement("span", {
    className: "chev"
  }, /*#__PURE__*/React.createElement(window.I.chev, null))), /*#__PURE__*/React.createElement("button", {
    className: "row-del",
    onClick: () => delMass(i),
    "aria-label": "Remove"
  }, /*#__PURE__*/React.createElement(window.I.trash, {
    style: {
      width: 15,
      height: 15
    }
  })))), d.massTimes.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 13.5
    }
  }, "No times added.")), /*#__PURE__*/React.createElement("div", {
    className: "form-grid",
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(FField, {
    label: "Confession"
  }, /*#__PURE__*/React.createElement("input", {
    value: d.confessions,
    onChange: e => set("confessions", e.target.value),
    placeholder: "Saturdays 4–5 pm"
  })), /*#__PURE__*/React.createElement(FField, {
    label: "Adoration",
    hint: "optional"
  }, /*#__PURE__*/React.createElement("input", {
    value: d.adoration,
    onChange: e => set("adoration", e.target.value),
    placeholder: "Thursdays 6 pm"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "form-sec"
  }, "Office hours", /*#__PURE__*/React.createElement("button", {
    className: "add-row",
    onClick: addHours
  }, /*#__PURE__*/React.createElement(window.I.plus, {
    style: {
      width: 14,
      height: 14
    }
  }), " Add hours")), /*#__PURE__*/React.createElement("div", {
    className: "row-stack"
  }, d.officeHours.map((o, i) => /*#__PURE__*/React.createElement("div", {
    className: "dyn-row hours",
    key: i
  }, /*#__PURE__*/React.createElement("input", {
    value: o.days,
    onChange: e => setHours(i, "days", e.target.value),
    placeholder: "Mon – Fri"
  }), /*#__PURE__*/React.createElement("input", {
    value: o.hours,
    onChange: e => setHours(i, "hours", e.target.value),
    placeholder: "8:00 AM – 5:00 PM"
  }), /*#__PURE__*/React.createElement("button", {
    className: "row-del",
    onClick: () => delHours(i),
    "aria-label": "Remove"
  }, /*#__PURE__*/React.createElement(window.I.trash, {
    style: {
      width: 15,
      height: 15
    }
  })))), d.officeHours.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 13.5
    }
  }, "No office hours added.")), /*#__PURE__*/React.createElement("div", {
    className: "form-sec"
  }, "Clergy", /*#__PURE__*/React.createElement("button", {
    className: "add-row",
    onClick: addClergy
  }, /*#__PURE__*/React.createElement(window.I.plus, {
    style: {
      width: 14,
      height: 14
    }
  }), " Add assistant")), /*#__PURE__*/React.createElement("div", {
    className: "form-grid"
  }, /*#__PURE__*/React.createElement(FField, {
    label: "Parish priest",
    full: true
  }, /*#__PURE__*/React.createElement("input", {
    value: d.priestName,
    onChange: e => set("priestName", e.target.value),
    placeholder: "e.g. Fr. John Mwangi"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "row-stack",
    style: {
      marginTop: 10
    }
  }, d.clergy.map((p, i) => /*#__PURE__*/React.createElement("div", {
    className: "dyn-row hours",
    key: i
  }, /*#__PURE__*/React.createElement("input", {
    value: p.name,
    onChange: e => setClergy(i, "name", e.target.value),
    placeholder: "Fr. …"
  }), /*#__PURE__*/React.createElement("input", {
    value: p.title,
    onChange: e => setClergy(i, "title", e.target.value),
    placeholder: "Assistant Priest"
  }), /*#__PURE__*/React.createElement("button", {
    className: "row-del",
    onClick: () => delClergy(i),
    "aria-label": "Remove"
  }, /*#__PURE__*/React.createElement(window.I.trash, {
    style: {
      width: 15,
      height: 15
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "form-sec"
  }, "Photos", /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "add-row",
    onClick: () => uploadTo("add"),
    disabled: !!uploading
  }, uploading ? /*#__PURE__*/React.createElement("span", {
    className: "spinner",
    style: {
      width: 13,
      height: 13
    }
  }) : /*#__PURE__*/React.createElement(window.I.upload, {
    style: {
      width: 14,
      height: 14
    }
  }), uploading ? "Uploading…" : "Upload image"), /*#__PURE__*/React.createElement("button", {
    className: "add-row find-row",
    onClick: findOnline,
    disabled: finding
  }, finding ? /*#__PURE__*/React.createElement("span", {
    className: "spinner",
    style: {
      width: 13,
      height: 13
    }
  }) : /*#__PURE__*/React.createElement(window.I.globe, {
    style: {
      width: 14,
      height: 14
    }
  }), finding ? "Searching…" : "Find photo online"), /*#__PURE__*/React.createElement("button", {
    className: "add-row",
    onClick: addImage
  }, /*#__PURE__*/React.createElement(window.I.plus, {
    style: {
      width: 14,
      height: 14
    }
  }), " Add image link"))), findMsg && /*#__PURE__*/React.createElement("div", {
    className: "find-msg"
  }, /*#__PURE__*/React.createElement(window.I.sparkle, {
    style: {
      width: 14,
      height: 14
    }
  }), " ", findMsg), /*#__PURE__*/React.createElement("div", {
    className: "form-grid"
  }, /*#__PURE__*/React.createElement(FField, {
    label: "Main / hero image",
    full: true,
    hint: "upload from your computer or paste a URL — shown on the parish page & cards"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: d.heroImage,
    onChange: e => set("heroImage", e.target.value),
    placeholder: "https://…/photo.jpg",
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "add-row",
    onClick: () => uploadTo("hero"),
    disabled: !!uploading,
    style: {
      flex: "none"
    }
  }, uploading === "hero" ? /*#__PURE__*/React.createElement("span", {
    className: "spinner",
    style: {
      width: 13,
      height: 13
    }
  }) : /*#__PURE__*/React.createElement(window.I.upload, {
    style: {
      width: 14,
      height: 14
    }
  }), " Upload")))), d.heroImage.trim() && /*#__PURE__*/React.createElement("div", {
    className: "img-preview"
  }, /*#__PURE__*/React.createElement("img", {
    src: d.heroImage,
    alt: "",
    onError: e => {
      e.target.style.display = "none";
    }
  }), /*#__PURE__*/React.createElement("span", null, "Hero preview")), /*#__PURE__*/React.createElement("div", {
    className: "row-stack",
    style: {
      marginTop: 10
    }
  }, d.images.map((url, i) => /*#__PURE__*/React.createElement("div", {
    className: "dyn-row img",
    key: i
  }, /*#__PURE__*/React.createElement("input", {
    value: url,
    onChange: e => setImage(i, e.target.value),
    placeholder: "Gallery image " + (i + 1) + " URL"
  }), /*#__PURE__*/React.createElement("button", {
    className: "add-row",
    onClick: () => uploadTo("img", i),
    disabled: !!uploading,
    style: {
      flex: "none"
    },
    title: "Upload from computer"
  }, uploading === "g" + i ? /*#__PURE__*/React.createElement("span", {
    className: "spinner",
    style: {
      width: 13,
      height: 13
    }
  }) : /*#__PURE__*/React.createElement(window.I.upload, {
    style: {
      width: 14,
      height: 14
    }
  })), /*#__PURE__*/React.createElement("button", {
    className: "row-del",
    onClick: () => delImage(i),
    "aria-label": "Remove"
  }, /*#__PURE__*/React.createElement(window.I.trash, {
    style: {
      width: 15,
      height: 15
    }
  })))), d.images.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 13.5
    }
  }, "No gallery images yet — upload from your computer, find one online, or click any frame on the parish page.")), /*#__PURE__*/React.createElement("div", {
    className: "form-sec"
  }, "Description"), /*#__PURE__*/React.createElement("div", {
    className: "form-grid"
  }, /*#__PURE__*/React.createElement(FField, {
    label: "About this parish",
    full: true,
    hint: "optional — auto-generated if blank"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: d.description,
    onChange: e => set("description", e.target.value),
    rows: 4,
    placeholder: "A short history or description…"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "modal-foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => onClose(false)
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: save
  }, /*#__PURE__*/React.createElement(window.I.check, {
    style: {
      width: 16,
      height: 16
    }
  }), " ", editing ? "Save changes" : "Add parish"))));
}
Object.assign(window, {
  ParishForm
});