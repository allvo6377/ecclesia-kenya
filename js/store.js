/* store.js — live parish data store backed by Supabase Postgres.
   Keeps the same public interface the views rely on (getAll/get/add/update/
   remove/importRecords/importCSVText/subscribe + CSV helpers) but persists to
   the database instead of the browser. Reads are public; writes are enforced
   admin-only by Row Level Security on the server. */
(function () {
  "use strict";

  /* ---------------- local stock photo library (offline imagery) ---------------- */
  var STOCK_EXT = [
    "assets/churches/facade-gothic-grey.png",
    "assets/churches/facade-gothic-stone.png",
    "assets/churches/facade-dusk.png",
    "assets/churches/exterior-modern-white.png",
    "assets/churches/chapel-countryside.png",
  ];
  var STOCK_INT = [
    "assets/hero-cathedral.png",
    "assets/churches/interior-stained-glass.png",
    "assets/churches/interior-modern-windows.png",
  ];
  function strHash(s) { var h = 0, i; for (i = 0; i < (s || "").length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; } return h; }
  function rotate(arr, off) { return arr.map(function (_, i) { return arr[(i + off) % arr.length]; }); }
  function assignSeedImages(c) {
    if (c.heroImage || (c.images && c.images.length)) return c;
    var h = strHash(c.id);
    var ext = rotate(STOCK_EXT, h % STOCK_EXT.length);
    var intr = rotate(STOCK_INT, h % STOCK_INT.length);
    c.heroImage = ext[0];
    c.images = [intr[0], intr[1 % STOCK_INT.length], ext[1 % STOCK_EXT.length], intr[2 % STOCK_INT.length], ext[2 % STOCK_EXT.length]];
    return c;
  }

  /* ---------------- slug / id ---------------- */
  function slugify(s) {
    return (s || "").toString().toLowerCase()
      .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "parish";
  }
  function uniqueId(base, taken) {
    var id = base, n = 2;
    while (taken[id]) { id = base + "-" + n++; }
    taken[id] = true;
    return id;
  }

  /* ---------------- CSV parser (RFC-4180-ish) ---------------- */
  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, "");
    var rows = [], row = [], field = "", i = 0, inQ = false, c;
    while (i < text.length) {
      c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i += 2; continue; } inQ = false; i++; continue; }
        field += c; i++; continue;
      }
      if (c === '"') { inQ = true; i++; continue; }
      if (c === ",") { row.push(field); field = ""; i++; continue; }
      if (c === "\r") { i++; continue; }
      if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
      field += c; i++;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (x) { return (x || "").trim() !== ""; }); });
  }
  function rowsToObjects(rows) {
    if (!rows.length) return [];
    var headers = rows[0].map(function (h) { return (h || "").trim(); });
    return rows.slice(1).map(function (r) {
      var o = {}; headers.forEach(function (h, idx) { o[h] = (r[idx] || "").trim(); }); return o;
    });
  }

  /* ---------------- field helpers ---------------- */
  function inferType(name) {
    var n = (name || "").toLowerCase();
    if (/basilica/.test(n)) return "Minor Basilica";
    if (/cathedral/.test(n)) return "Cathedral";
    if (/shrine/.test(n)) return "Shrine";
    if (/chapel|campus/.test(n)) return "Chapel";
    return "Parish Church";
  }
  var DIOCESE_MAP = { nairobi: "Archdiocese of Nairobi", mombasa: "Archdiocese of Mombasa", kisumu: "Archdiocese of Kisumu", nyeri: "Archdiocese of Nyeri" };
  function prettyDiocese(d) {
    if (!d) return "Archdiocese of Nairobi";
    var key = d.trim().toLowerCase();
    if (DIOCESE_MAP[key]) return DIOCESE_MAP[key];
    if (/^arch|^diocese/i.test(d)) return d.trim();
    return "Diocese of " + d.trim();
  }
  function parseCoords(str) {
    if (!str) return null;
    var m = str.replace(/[()]/g, "").split(",");
    if (m.length < 2) return null;
    var lat = parseFloat(m[0]), lng = parseFloat(m[1]);
    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -5.2 || lat > 5.5 || lng < 33 || lng > 42.5) return null;
    return { lat: lat, lng: lng };
  }
  var LANG_KEYS = [
    [/kiswahili|kis\b|kis\./i, "Swahili"], [/swahili/i, "Swahili"], [/english|eng\b|eng\./i, "English"],
    [/kikuyu/i, "Kikuyu"], [/kimeru/i, "Kimeru"], [/kamba/i, "Kamba"], [/kipsigis/i, "Kipsigis"],
    [/latin/i, "Latin"], [/children'?s?/i, "Children's"],
  ];
  function detectLang(s) { for (var i = 0; i < LANG_KEYS.length; i++) if (LANG_KEYS[i][0].test(s)) return LANG_KEYS[i][1]; return ""; }
  var TIME_RE = /\d{1,2}(:\d{2})?\s*[ap]\.?m\.?/gi;
  function parseSchedule(str, defaultDay) {
    if (!str) return [];
    var out = [];
    str.split(/;/).forEach(function (part) {
      part = part.trim(); if (!part) return;
      var lang = detectLang(part);
      var times = part.match(TIME_RE);
      var label = part.replace(TIME_RE, "").replace(/english|kiswahili|swahili|kikuyu|kimeru|kamba|kipsigis|latin|children'?s?|eng\.?|kis\.?|and|,/gi, "").trim();
      label = label.replace(/\s{2,}/g, " ").replace(/^[-–\s]+|[-–\s]+$/g, "");
      if (times) { times.forEach(function (t) { out.push({ day: label || defaultDay, time: t.replace(/\s+/g, " ").trim(), language: lang }); }); }
      else if (part) { out.push({ day: defaultDay, time: part, language: lang }); }
    });
    return out;
  }
  function buildClergy(o) {
    var list = [];
    ["Asst. 1", "Asst. 2", "Asst. 3", "Asst. 4"].forEach(function (k) { if (o[k]) list.push({ name: o[k], title: "Assistant Priest" }); });
    return list;
  }

  /* ---------------- normalize ANY record to full shape ---------------- */
  function normalize(rec, taken) {
    rec = rec || {};
    var name = (rec.name || "Unnamed Parish").trim();
    var area = (rec.city || rec.area || "").trim();
    var diocese = rec.diocese || "Archdiocese of Nairobi";
    var county = (rec.county || "").trim();
    var coords = rec.coords && typeof rec.coords.lat === "number" ? rec.coords : null;
    var base = slugify(name) + (area ? "-" + slugify(area) : "");
    var id = rec.id && !(taken && taken[rec.id]) ? rec.id : uniqueId(base, taken || {});
    if (taken && rec.id) taken[rec.id] = true;
    var gallery = (rec.gallery && rec.gallery.length) ? rec.gallery : ["parish exterior", "church interior", "altar & sanctuary", "parish community"];
    var description = rec.description || (name + " is a Catholic " + (rec.type ? rec.type.toLowerCase() : "parish") + (area ? " in " + area : "") + (rec.deanery ? ", " + rec.deanery + " Deanery" : "") + ", part of the " + diocese + ".");
    return {
      id: id, name: name, type: rec.type || inferType(name), patron: rec.patron || "",
      diocese: diocese, deanery: rec.deanery || "", city: area, county: county,
      address: (rec.address || "").trim(), poBox: rec.poBox || "", coords: coords,
      founded: rec.founded || null,
      tagline: rec.tagline || (area ? "A Catholic parish in " + area + "." : "A Catholic parish."),
      description: description,
      priest: rec.priest && rec.priest.name ? rec.priest : (rec.priestName ? { name: rec.priestName, title: "Parish Priest" } : null),
      clergy: rec.clergy || [],
      contact: {
        phone: (rec.contact && rec.contact.phone) || rec.phone || "",
        email: (rec.contact && rec.contact.email) || rec.email || "",
        website: (rec.contact && rec.contact.website) || rec.website || "",
      },
      socials: rec.socials || {},
      officeHours: rec.officeHours || [], massTimes: rec.massTimes || [],
      confessions: rec.confessions || "", adoration: rec.adoration || "",
      sacraments: rec.sacraments || ["Baptism", "Reconciliation", "Holy Eucharist", "Confirmation", "Holy Matrimony", "Anointing of the Sick"],
      services: rec.services || [], gallery: gallery,
      heroImage: rec.heroImage || "", images: Array.isArray(rec.images) ? rec.images.filter(Boolean) : [],
      events: rec.events || [], source: rec.source || "manual",
    };
  }

  function csvRowToRecord(o) {
    var name = o["Name"] || "";
    var massTimes = [].concat(parseSchedule(o["Sunday"], "Sunday")).concat(parseSchedule(o["Weekdays"], "Weekdays")).concat(parseSchedule(o["Public Holidays"], "Public Holidays"));
    var socials = {}; ["Facebook", "Twitter", "Instagram", "Youtube"].forEach(function (k) { if (o[k]) socials[k.toLowerCase()] = o[k]; });
    var officeHours = o["Office Hours"] ? [{ days: "By appointment", hours: o["Office Hours"] }] : [];
    return {
      name: name, type: inferType(name), diocese: prettyDiocese(o["Diocese"]), deanery: o["Deanery"] || "",
      city: o["Area"] || "", county: o["County"] || (o["Diocese"] === "Nairobi" ? "Nairobi" : ""),
      address: o["Physical Address"] || (o["Road"] ? o["Road"] : ""), poBox: o["P. O. Box"] || "",
      coords: parseCoords(o["Coordinates"]), phone: o["Telephone"] || "", email: o["email"] || "", website: o["Website"] || "",
      socials: socials, massTimes: massTimes, confessions: o["Confession"] || "", adoration: o["Adoration"] || "",
      officeHours: officeHours, priestName: o["Parish Priest"] || "", clergy: buildClergy(o),
      heroImage: o["Image"] || o["Photo"] || o["Photo URL"] || "",
      images: (o["Gallery"] || o["Photos"] || "").split(/[;|]/).map(function (s) { return s.trim(); }).filter(Boolean),
      source: "import",
    };
  }
  function validateRaw(rec) {
    var flags = [];
    if (!rec.name) flags.push({ level: "error", msg: "Missing name" });
    if (!rec.coords) flags.push({ level: "warn", msg: "No coordinates" });
    if (!rec.phone && !rec.email) flags.push({ level: "warn", msg: "No contact" });
    if (!rec.massTimes.length) flags.push({ level: "warn", msg: "No Mass times" });
    return flags;
  }

  /* ---------------- Supabase persistence ---------------- */
  function rowFromRecord(n) {
    return {
      id: n.id, name: n.name, type: n.type || null, diocese: n.diocese || null,
      county: n.county || null, city: n.city || null,
      lat: n.coords && typeof n.coords.lat === "number" ? n.coords.lat : null,
      lng: n.coords && typeof n.coords.lng === "number" ? n.coords.lng : null,
      source: n.source || "manual", data: n,
    };
  }

  var subscribers = [];
  var working = [];
  var loaded = false;
  function notify() { subscribers.forEach(function (fn) { try { fn(); } catch (e) {} }); }
  function takenMap() { var t = {}; working.forEach(function (c) { t[c.id] = true; }); return t; }

  function recordFromRow(row) {
    var rec = (row && row.data && typeof row.data === "object") ? row.data : {};
    rec.id = row.id;
    // ensure promoted columns win if data is partial
    rec.name = rec.name || row.name;
    rec.diocese = rec.diocese || row.diocese;
    rec.source = rec.source || row.source || "manual";
    if (!rec.coords && typeof row.lat === "number") rec.coords = { lat: row.lat, lng: row.lng };
    return assignSeedImages(normalize(rec, {}));
  }

  function load() {
    return window.sb.from("parishes").select("*").order("name", { ascending: true })
      .then(function (res) {
        if (res.error) { console.error("[Ecclesia] load parishes failed:", res.error.message); return; }
        working = (res.data || []).map(recordFromRow);
        loaded = true;
        notify();
      });
  }

  function reportWriteError(e) {
    var msg = (e && e.message) || String(e);
    console.error("[Ecclesia] write failed:", msg);
    try { window.dispatchEvent(new CustomEvent("ecclesia:writeerror", { detail: msg })); } catch (x) {}
    // resync local cache with the server's truth
    load();
  }

  var ParishStore = {
    parseCSV: parseCSV, rowsToObjects: rowsToObjects, csvRowToRecord: csvRowToRecord,
    validateRaw: validateRaw,
    normalize: function (rec, taken) { return normalize(rec, taken || takenMap()); },

    isLoaded: function () { return loaded; },
    load: load,

    getAll: function () { return working.map(function (c) { return c; }); },
    get: function (id) { return working.find(function (c) { return c.id === id; }) || null; },
    count: function () { return working.length; },

    add: function (rec) {
      var n = assignSeedImages(normalize(rec, takenMap()));
      working.unshift(n); notify();                       // optimistic
      window.sb.from("parishes").insert(rowFromRecord(n)).then(function (res) {
        if (res.error) reportWriteError(res.error);
      });
      return n;
    },

    update: function (id, rec) {
      var idx = working.findIndex(function (c) { return c.id === id; });
      if (idx < 0) return null;
      var merged = Object.assign({}, working[idx], rec, { id: id });
      var n = normalize(merged, {});
      working[idx] = n; notify();                          // optimistic
      window.sb.from("parishes").update(rowFromRecord(n)).eq("id", id).then(function (res) {
        if (res.error) reportWriteError(res.error);
      });
      return n;
    },

    remove: function (id) {
      working = working.filter(function (c) { return c.id !== id; }); notify();  // optimistic
      window.sb.from("parishes").delete().eq("id", id).then(function (res) {
        if (res.error) reportWriteError(res.error);
      });
    },

    importRecords: function (rawRecs) {
      var taken = takenMap(), added = [];
      rawRecs.forEach(function (r) { var n = assignSeedImages(normalize(r, taken)); working.push(n); added.push(n); });
      notify();                                            // optimistic
      window.sb.from("parishes").insert(added.map(rowFromRecord)).then(function (res) {
        if (res.error) reportWriteError(res.error);
      });
      return added;
    },

    importCSVText: function (text) {
      var objs = rowsToObjects(parseCSV(text));
      var recs = objs.map(csvRowToRecord);
      return this.importRecords(recs);
    },

    // In production "reset" simply reloads the authoritative server state.
    reset: function () { return load(); },

    subscribe: function (fn) {
      subscribers.push(fn);
      return function () { subscribers = subscribers.filter(function (f) { return f !== fn; }); };
    },
  };

  window.ParishStore = ParishStore;
  // kick off the initial load immediately
  load();
})();
