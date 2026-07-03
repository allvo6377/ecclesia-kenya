/* editor.js — in-browser visual content editor ("no-code builder").

   Two responsibilities:
   1) FOR EVERYONE: load saved content overrides (text, images, styles, theme,
      hidden/reorder) from the `site_content` table and apply them to the live
      page, so whatever an administrator edits is what visitors see.
   2) FOR SIGNED-IN ADMINS: an Edit mode that lets you click any text to retype
      it, click any image to replace it (uploaded to secure storage), restyle
      or hide elements, reorder them, and change the site theme — no code.

   All saves go through Supabase and are accepted only for administrators
   (enforced server-side by Row Level Security). */
(function () {
  "use strict";

  var KEYS = ["texts", "images", "styles", "hidden", "order", "theme"];
  var DEFAULT_THEME = { primaryColor: "#1462b8", headingFont: "Newsreader", homeLayout: "split", cardStyle: "border" };

  var data = { texts: {}, images: {}, styles: {}, hidden: {}, order: {}, theme: {} };
  var editMode = false;
  var selected = null;
  var subs = [];

  /* ----- editable text = any leaf element with visible text, outside the
     dynamic/data-driven zones (parish pages, cards, search, map, admin). ----- */
  var TEXT_SEL = "h1,h2,h3,h4,h5,h6,p,span,a,li,label,small,strong,em,b,i,blockquote,figcaption,div,button";
  // zones whose text comes from the database or is interactive UI we shouldn't free-edit
  var EXCL_ZONE = ".cp,.admin,.modal-overlay,.login-wrap,.ch-card,.card-list,.sd-row,.search-dropdown,.map-col,.leaflet-container,.select-wrap,.search";
  function isEditableText(el) {
    if (!el || !el.matches) return false;
    if (!el.closest("#root")) return false;            // never the editor's own chrome
    if (el.childElementCount > 0) {                     // leaf only (allow a single <mark>)
      if (!(el.childElementCount === 1 && el.firstElementChild.tagName === "MARK")) return false;
    }
    if (!(el.textContent || "").trim()) return false;  // must actually contain text
    if (el.closest("input,textarea,select,svg")) return false;
    var tagged = el.hasAttribute && el.hasAttribute("data-ek");
    if (!tagged && el.closest(EXCL_ZONE)) return false;
    if (!tagged && !el.matches(TEXT_SEL)) return false;
    return true;
  }

  /* ----- stable key for an element, scoped to the current route ----- */
  function routeKey() { return (location.hash || "#home").replace(/^#/, "") || "home"; }
  function elKey(el) {
    if (el.getAttribute && el.getAttribute("data-ek")) return el.getAttribute("data-ek");
    if (el.__ek) return el.__ek;
    var parts = [], n = el;
    while (n && n.id !== "root" && n !== document.body && n.parentElement) {
      var tag = n.tagName.toLowerCase();
      var idx = 1, sib = n;
      while ((sib = sib.previousElementSibling)) { if (sib.tagName === n.tagName) idx++; }
      parts.unshift(tag + ":" + idx);
      n = n.parentElement;
    }
    el.__ek = routeKey() + "/" + parts.join(">");
    return el.__ek;
  }

  /* ---------------- apply overrides to the page ---------------- */
  function applyTheme() {
    var t = Object.assign({}, DEFAULT_THEME, data.theme || {});
    if (window.applyTheme) window.applyTheme(t);
    try { window.dispatchEvent(new CustomEvent("ecclesia:theme", { detail: t })); } catch (e) {}
  }

  var applying = false;
  function applyOverrides() {
    if (applying) return; applying = true;
    try {
      var root = document.getElementById("root");
      if (!root) return;

      // text
      root.querySelectorAll(TEXT_SEL + ",[data-ek]").forEach(function (el) {
        if (!isEditableText(el)) return;
        var k = elKey(el);
        if (Object.prototype.hasOwnProperty.call(data.texts, k)) {
          if (document.activeElement === el) return; // don't fight the typist
          if (el.textContent !== data.texts[k]) el.textContent = data.texts[k];
        }
      });

      // images
      root.querySelectorAll("img").forEach(function (img) {
        if (img.closest(".cp,.admin,.modal-overlay,.login-wrap")) return;
        var k = elKey(img);
        if (data.images[k] && img.getAttribute("src") !== data.images[k]) {
          img.setAttribute("src", data.images[k]);
        }
      });

      // styles
      Object.keys(data.styles).forEach(function (k) {
        var el = findByKey(root, k);
        if (el) { var s = data.styles[k]; Object.keys(s).forEach(function (p) { el.style.setProperty(p, s[p]); }); }
      });

      // hidden
      root.querySelectorAll("[data-ek-hidden]").forEach(function (el) { el.removeAttribute("data-ek-hidden"); el.style.removeProperty("display"); });
      Object.keys(data.hidden).forEach(function (k) {
        var el = findByKey(root, k);
        if (el && data.hidden[k]) {
          if (editMode) { el.setAttribute("data-ek-hidden", "1"); el.style.removeProperty("display"); }
          else el.style.setProperty("display", "none");
        }
      });

      // order (reorder children of a parent to a saved sequence)
      Object.keys(data.order).forEach(function (pk) {
        var parent = findByKey(root, pk);
        if (!parent) return;
        var want = data.order[pk];
        want.forEach(function (ck) {
          var child = Array.prototype.find.call(parent.children, function (c) { return elKey(c) === ck; });
          if (child) parent.appendChild(child);
        });
      });
    } finally { applying = false; }
  }

  function findByKey(root, k) {
    if (k.indexOf("/") < 0) { try { return root.querySelector('[data-ek="' + k + '"]'); } catch (e) { return null; } }
    // only search current-route elements (key is route-prefixed)
    if (k.split("/")[0] !== routeKey()) return null;
    var all = root.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) { if (elKey(all[i]) === k) return all[i]; }
    return null;
  }

  /* ---------------- persistence ---------------- */
  function loadAll() {
    return window.sb.from("site_content").select("key,value").in("key", KEYS).then(function (res) {
      if (res.error) { console.warn("[Ecclesia] site_content load:", res.error.message); return; }
      (res.data || []).forEach(function (row) { if (row && row.key) data[row.key] = row.value || {}; });
      applyTheme();
      applyOverrides();
      notify();
    });
  }
  var saveTimers = {};
  function save(key) {
    clearTimeout(saveTimers[key]);
    saveTimers[key] = setTimeout(function () {
      window.sb.from("site_content").upsert({ key: key, value: data[key] }, { onConflict: "key" }).then(function (res) {
        if (res.error) { flash("Couldn't save (" + res.error.message + ")", true); }
        else flash("Saved");
      });
    }, 500);
  }

  /* ---------------- image upload to Supabase Storage ---------------- */
  function uploadImage(file) {
    var ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
    var path = "site/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
    return window.sb.storage.from(window.SUPA.bucket).upload(path, file, { cacheControl: "3600", upsert: false })
      .then(function (res) {
        if (res.error) throw res.error;
        return window.sb.storage.from(window.SUPA.bucket).getPublicUrl(path).data.publicUrl;
      });
  }
  // exported for parish image editing (church.jsx)
  window.uploadParishImage = function (file, prefix) {
    var ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
    var path = (prefix || "parish") + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
    return window.sb.storage.from(window.SUPA.bucket).upload(path, file, { cacheControl: "3600", upsert: false })
      .then(function (res) { if (res.error) throw res.error; return window.sb.storage.from(window.SUPA.bucket).getPublicUrl(path).data.publicUrl; });
  };

  function pickFile() {
    return new Promise(function (resolve) {
      var inp = document.createElement("input");
      inp.type = "file"; inp.accept = "image/*";
      inp.onchange = function () { resolve(inp.files && inp.files[0]); };
      inp.click();
    });
  }

  /* ---------------- edit-mode interactions ---------------- */
  function enableEditing() {
    var root = document.getElementById("root"); if (!root) return;
    document.body.classList.add("ecclesia-edit");
    root.querySelectorAll(TEXT_SEL + ",[data-ek]").forEach(function (el) {
      if (!isEditableText(el)) return;
      el.setAttribute("contenteditable", "true");
      el.classList.add("ek-editable");
    });
    root.querySelectorAll("img").forEach(function (img) {
      if (img.closest(".cp,.admin,.modal-overlay,.login-wrap")) return;
      img.classList.add("ek-img-editable");
    });
    applyOverrides();
  }
  function disableEditing() {
    var root = document.getElementById("root"); if (!root) return;
    document.body.classList.remove("ecclesia-edit");
    root.querySelectorAll(".ek-editable").forEach(function (el) { el.removeAttribute("contenteditable"); el.classList.remove("ek-editable"); });
    root.querySelectorAll(".ek-img-editable").forEach(function (img) { img.classList.remove("ek-img-editable"); });
    deselect();
    applyOverrides();
  }

  document.addEventListener("input", function (e) {
    if (!editMode) return;
    var el = e.target;
    if (el.classList && el.classList.contains("ek-editable")) {
      data.texts[elKey(el)] = el.textContent;
      save("texts");
    }
  });

  document.addEventListener("click", function (e) {
    if (!editMode) return;
    // clicking editable text: block the app's navigation and let the caret land.
    var edt = e.target.closest && e.target.closest(TEXT_SEL);
    if (edt && isEditableText(edt)) {
      e.stopPropagation();
      if (!edt.isContentEditable) { edt.setAttribute("contenteditable", "true"); edt.classList.add("ek-editable"); edt.focus(); }
      return;
    }
    var img = e.target.closest && e.target.closest("img.ek-img-editable");
    if (img) {
      e.preventDefault(); e.stopPropagation();
      var k = elKey(img);
      flash("Choose an image…");
      pickFile().then(function (file) {
        if (!file) return;
        flash("Uploading…");
        uploadImage(file).then(function (url) {
          data.images[k] = url; img.setAttribute("src", url); save("images");
        }).catch(function (err) { flash("Upload failed: " + (err.message || err), true); });
      });
      return;
    }
    var sel = e.target.closest && e.target.closest("#root *");
    if (sel && sel.closest(".cp,.admin,.modal-overlay,.login-wrap")) return;
    if (sel && !sel.classList.contains("ek-editable")) { selectEl(sel); }
  }, true);

  function selectEl(el) {
    deselect();
    selected = el;
    el.classList.add("ek-selected");
    showInspector(el);
  }
  function deselect() {
    if (selected) selected.classList.remove("ek-selected");
    selected = null;
    var insp = document.getElementById("ek-inspector"); if (insp) insp.style.display = "none";
  }

  /* ---------------- floating UI ---------------- */
  var flashTimer;
  function flash(msg, bad) {
    var f = document.getElementById("ek-flash"); if (!f) return;
    f.textContent = msg; f.className = "ek-flash show" + (bad ? " bad" : "");
    clearTimeout(flashTimer); flashTimer = setTimeout(function () { f.className = "ek-flash"; }, 2200);
  }

  function buildUI() {
    if (document.getElementById("ek-toggle")) return;

    var toggle = document.createElement("button");
    toggle.id = "ek-toggle"; toggle.type = "button";
    toggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg><span>Edit site</span>';
    toggle.onclick = function () { setEditMode(!editMode); };
    document.body.appendChild(toggle);

    var panel = document.createElement("div");
    panel.id = "ek-panel";
    panel.innerHTML =
      '<div class="ek-h"><b>Site editor</b><button id="ek-close" title="Done">Done</button></div>' +
      '<div class="ek-hint">Click any text to retype it. Click any image to replace it. Click any block to style, hide or move it.</div>' +
      '<div class="ek-grp"><div class="ek-lab">Theme colour</div><div id="ek-colors" class="ek-colors"></div>' +
        '<input type="color" id="ek-color-custom" title="Custom colour"></div>' +
      '<div class="ek-grp"><div class="ek-lab">Heading font</div>' +
        '<select id="ek-font"><option>Newsreader</option><option>Spectral</option><option>Lora</option></select></div>' +
      '<div class="ek-grp"><div class="ek-lab">Home layout</div>' +
        '<select id="ek-layout"><option value="split">Split (list + map)</option><option value="stacked">Stacked</option></select></div>' +
      '<div class="ek-grp"><div class="ek-lab">Card style</div>' +
        '<select id="ek-card"><option value="border">Bordered</option><option value="soft">Soft shadow</option></select></div>' +
      '<div class="ek-grp"><button id="ek-revert" class="ek-revert">Reset all site edits</button></div>';
    document.body.appendChild(panel);

    var insp = document.createElement("div");
    insp.id = "ek-inspector";
    insp.innerHTML =
      '<div class="ek-i-row"><button data-act="bigger" title="Larger text">A+</button><button data-act="smaller" title="Smaller text">A−</button>' +
      '<button data-act="bold" title="Bold">B</button>' +
      '<button data-act="left" title="Align left">⬅</button><button data-act="center" title="Center">⬌</button><button data-act="right" title="Align right">➡</button></div>' +
      '<div class="ek-i-row"><label>Colour <input type="color" data-act="color"></label></div>' +
      '<div class="ek-i-row"><button data-act="up">↑ Move</button><button data-act="down">↓ Move</button>' +
      '<button data-act="hide">Hide</button><button data-act="reset">Reset</button></div>';
    document.body.appendChild(insp);

    var flashEl = document.createElement("div"); flashEl.id = "ek-flash"; flashEl.className = "ek-flash"; document.body.appendChild(flashEl);

    // color swatches
    var swatches = ["#1462b8", "#12a06a", "#1e3a5f", "#2f5d50", "#7a1f2b", "#5b3b8c"];
    var cwrap = panel.querySelector("#ek-colors");
    swatches.forEach(function (c) {
      var b = document.createElement("button"); b.style.background = c; b.title = c;
      b.onclick = function () { setTheme("primaryColor", c); };
      cwrap.appendChild(b);
    });
    panel.querySelector("#ek-color-custom").oninput = function (e) { setTheme("primaryColor", e.target.value); };
    panel.querySelector("#ek-font").onchange = function (e) { setTheme("headingFont", e.target.value); };
    panel.querySelector("#ek-layout").onchange = function (e) { setTheme("homeLayout", e.target.value); };
    panel.querySelector("#ek-card").onchange = function (e) { setTheme("cardStyle", e.target.value); };
    panel.querySelector("#ek-close").onclick = function () { setEditMode(false); };
    panel.querySelector("#ek-revert").onclick = function () {
      if (!confirm("Remove ALL your site edits (text, images, styles, theme) and restore defaults?")) return;
      data = { texts: {}, images: {}, styles: {}, hidden: {}, order: {}, theme: {} };
      KEYS.forEach(function (k) { window.sb.from("site_content").upsert({ key: k, value: {} }, { onConflict: "key" }); });
      location.reload();
    };

    insp.addEventListener("click", function (e) {
      var act = e.target.getAttribute("data-act"); if (!act || !selected) return;
      var k = elKey(selected);
      var st = data.styles[k] = data.styles[k] || {};
      function px(v, d) { return parseFloat(v) || d; }
      if (act === "bigger" || act === "smaller") {
        var cur = px(getComputedStyle(selected).fontSize, 16);
        var nv = Math.max(9, cur + (act === "bigger" ? 2 : -2));
        st["font-size"] = nv + "px"; selected.style.setProperty("font-size", nv + "px");
      } else if (act === "bold") {
        var b = getComputedStyle(selected).fontWeight; var nb = (b === "700" || b === "bold") ? "400" : "700";
        st["font-weight"] = nb; selected.style.setProperty("font-weight", nb);
      } else if (act === "left" || act === "center" || act === "right") {
        st["text-align"] = act; selected.style.setProperty("text-align", act);
      } else if (act === "up" || act === "down") {
        var parent = selected.parentElement; if (!parent) return;
        var sib = act === "up" ? selected.previousElementSibling : selected.nextElementSibling;
        if (!sib) return;
        if (act === "up") parent.insertBefore(selected, sib); else parent.insertBefore(sib, selected);
        var pk = elKey(parent);
        data.order[pk] = Array.prototype.map.call(parent.children, function (c) { return elKey(c); });
        save("order"); positionInspector(selected); return;
      } else if (act === "hide") {
        data.hidden[k] = true; save("hidden"); deselect(); applyOverrides(); flash("Element hidden — reset from the editor list"); return;
      } else if (act === "reset") {
        delete data.styles[k]; delete data.hidden[k]; selected.removeAttribute("style"); save("styles"); save("hidden");
      }
      if (act === "color") return;
      save("styles");
    });
    insp.querySelector('[data-act="color"]').oninput = function (e) {
      if (!selected) return; var k = elKey(selected);
      var st = data.styles[k] = data.styles[k] || {};
      st["color"] = e.target.value; selected.style.setProperty("color", e.target.value); save("styles");
    };
  }

  function showInspector(el) {
    var insp = document.getElementById("ek-inspector"); if (!insp) return;
    insp.style.display = "block";
    positionInspector(el);
  }
  function positionInspector(el) {
    var insp = document.getElementById("ek-inspector"); if (!insp) return;
    var r = el.getBoundingClientRect();
    var top = window.scrollY + r.top - insp.offsetHeight - 8;
    if (top < window.scrollY + 8) top = window.scrollY + r.bottom + 8;
    insp.style.top = top + "px";
    insp.style.left = Math.max(8, Math.min(window.scrollX + r.left, window.innerWidth - insp.offsetWidth - 8)) + "px";
  }

  function syncPanel() {
    var t = Object.assign({}, DEFAULT_THEME, data.theme || {});
    var f = document.getElementById("ek-font"); if (f) f.value = t.headingFont;
    var l = document.getElementById("ek-layout"); if (l) l.value = t.homeLayout;
    var c = document.getElementById("ek-card"); if (c) c.value = t.cardStyle;
    var cc = document.getElementById("ek-color-custom"); if (cc) cc.value = t.primaryColor;
  }

  function setTheme(key, val) {
    data.theme = Object.assign({}, DEFAULT_THEME, data.theme || {});
    data.theme[key] = val;
    applyTheme(); save("theme"); syncPanel();
  }

  function setEditMode(on) {
    if (!window.AdminAuth || !window.AdminAuth.isAuthed()) on = false;
    editMode = on;
    var toggle = document.getElementById("ek-toggle");
    var panel = document.getElementById("ek-panel");
    if (toggle) toggle.classList.toggle("active", on);
    if (panel) panel.style.display = on ? "block" : "none";
    if (on) { enableEditing(); syncPanel(); flash("Edit mode on"); }
    else disableEditing();
  }

  /* ---------------- boot ---------------- */
  function notify() { subs.forEach(function (f) { try { f(); } catch (e) {} }); }

  function refreshForAuth() {
    var admin = window.AdminAuth && window.AdminAuth.isAuthed();
    var toggle = document.getElementById("ek-toggle");
    if (admin) { buildUI(); if (toggle === null) buildUI(); document.getElementById("ek-toggle").style.display = "flex"; }
    else { if (toggle) toggle.style.display = "none"; setEditMode(false); }
  }

  function start() {
    loadAll();
    // re-apply overrides whenever React re-renders
    var root = document.getElementById("root");
    if (root) {
      var mo = new MutationObserver(function () {
        // clear cached keys (DOM replaced) then re-apply
        applyOverrides();
        if (editMode) enableEditing();
      });
      mo.observe(root, { childList: true, subtree: true });
    }
    window.addEventListener("hashchange", function () { setTimeout(applyOverrides, 30); });
    if (window.AdminAuth) {
      window.AdminAuth.subscribe(refreshForAuth);
      window.AdminAuth.ready ? window.AdminAuth.ready().then(refreshForAuth) : refreshForAuth();
    }
  }

  window.SiteEditor = { isEditing: function () { return editMode; }, reload: loadAll };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
