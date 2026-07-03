/* church.jsx — individual parish page (shared via window) */

function InfoCard({ label, icon, children }) {
  return (
    <div className="info-card">
      <div className="ic-label">{icon} {label}</div>
      {children}
    </div>
  );
}

function ContactRow({ icon, k, children }) {
  return (
    <div className="contact-row">
      <div className="ci">{icon}</div>
      <div className="cv"><div className="k">{k}</div>{children}</div>
    </div>
  );
}

/* image frame: click-to-replace for admins (uploads to secure storage and
   saves to the parish record), static image/placeholder for visitors. */
function Frame({ church, target, src, label, className, admin }) {
  const [busy, setBusy] = React.useState(false);

  function replace() {
    if (!admin || busy) return;
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/*";
    inp.onchange = function () {
      const file = inp.files && inp.files[0];
      if (!file) return;
      setBusy(true);
      window.uploadParishImage(file, church.id).then((url) => {
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
      }).catch((e) => { setBusy(false); alert("Upload failed: " + (e.message || e)); });
    };
    inp.click();
  }

  return (
    <div className={"slot-wrap " + (className || "") + (admin ? " frame-editable" : "")}
      onClick={admin ? replace : undefined}
      title={admin ? "Click to replace this image" : undefined}>
      {src
        ? <img className="frame-img" src={src} alt={label || ""} loading="lazy" />
        : <window.PH label={label} />}
      {admin && (
        <div className="frame-edit-badge">
          {busy ? <span className="spinner" /> : <window.I.upload style={{ width: 14, height: 14 }} />}
          <span>{busy ? "Uploading…" : "Replace"}</span>
        </div>
      )}
    </div>
  );
}

function ChurchPage({ church: c, navigate, admin }) {
  React.useEffect(() => { window.scrollTo(0, 0); }, [c.id]);

  const hasCoords = c.coords && typeof c.coords.lat === "number";
  const dirUrl = hasCoords ? `https://www.google.com/maps/dir/?api=1&destination=${c.coords.lat},${c.coords.lng}` : null;
  const mapsUrl = hasCoords ? `https://www.openstreetmap.org/?mlat=${c.coords.lat}&mlon=${c.coords.lng}#map=16/${c.coords.lat}/${c.coords.lng}` : null;

  const ct = c.contact || {};
  const hasContact = ct.phone || ct.email || ct.website || c.address || c.poBox;
  const clergyList = [].concat(c.priest ? [c.priest] : [], c.clergy || []);
  const subBits = [];
  if (c.city || c.county) subBits.push(<span key="loc"><window.I.pin /> {[c.city, c.county].filter(Boolean).join(", ")}</span>);
  subBits.push(<span key="dio"><window.I.cross style={{ width: 14, height: 14 }} /> {c.diocese}</span>);
  if (c.deanery) subBits.push(<span key="dean">{c.deanery} Deanery</span>);
  if (c.founded) subBits.push(<span key="est">Est. {c.founded}</span>);

  let si = 0;

  return (
    <div className="cp">
      <a className="cp-back" onClick={() => navigate(null)}><window.I.back /> All parishes</a>

      {/* hero */}
      <div className="cp-hero">
        <div className="cp-hero-main">
          <Frame church={c} target={{ kind: "hero" }} src={c.heroImage || c.images[0]} label={c.gallery[0]} className="hero-slot" admin={admin} />
          <div className="cp-hero-overlay">
            <span className="chip chip-type">{c.type}</span>
            <h1>{c.name}</h1>
            <div className="sub">{subBits}</div>
          </div>
        </div>
        <div className="cp-hero-side">
          <Frame church={c} target={{ kind: "image", idx: 1 }} src={c.images[1]} label={c.gallery[1]} admin={admin} />
          <Frame church={c} target={{ kind: "image", idx: 2 }} src={c.images[2]} label={c.gallery[2]} admin={admin} />
        </div>
      </div>

      <div className="cp-grid">
        {/* ---- main column ---- */}
        <div className="cp-main">
          <div className="section" style={{ "--i": si++ }}>
            <h2 data-ek="parish.s.about">About this parish</h2>
            <p className="lede" style={{ marginTop: 14 }}>{c.description}</p>
          </div>

          <div className="section" style={{ "--i": si++ }}>
            <h2 data-ek="parish.s.mass">Mass &amp; service times</h2>
            {c.confessions && <div className="sec-sub">Confessions: {c.confessions}{c.adoration ? " · Adoration: " + c.adoration : ""}</div>}
            {c.massTimes.length ? (
              <div className="mass-table">
                {c.massTimes.map((m, i) => (
                  <div className="mass-row" key={i}>
                    <div className="m-day">{m.day}</div>
                    <div className="m-time">{m.time}</div>
                    <div>{m.language ? <span className="chip chip-lang">{m.language}</span> : null}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty" style={{ textAlign: "left", padding: "20px 22px" }}>
                Mass schedule not yet listed for this parish. <a style={{ color: "var(--primary)", fontWeight: 600, cursor: "pointer" }} onClick={() => { window.__ecclesiaEdit = c.id; navigate("admin"); }}>Add times in Admin →</a>
              </div>
            )}
          </div>

          {(c.sacraments.length > 0 || c.services.length > 0) && (
            <div className="section" style={{ "--i": si++ }}>
              <h2 data-ek="parish.s.sacraments">Sacraments &amp; services</h2>
              <div className="sec-sub">Celebrated and offered at {c.name}.</div>
              <div className="info-grid">
                {c.sacraments.length > 0 && (
                  <InfoCard label="Sacraments" icon={<window.I.cross style={{ width: 14, height: 14 }} />}>
                    <div className="tag-wrap" style={{ marginTop: 2 }}>
                      {c.sacraments.map((s) => <span key={s} className="chip"><window.I.check style={{ color: "var(--primary)" }} /> {s}</span>)}
                    </div>
                  </InfoCard>
                )}
                {c.services.length > 0 && (
                  <InfoCard label="Ministries & groups" icon={<window.I.people />}>
                    <div className="tag-wrap" style={{ marginTop: 2 }}>
                      {c.services.map((s) => <span key={s} className="chip chip-primary">{s}</span>)}
                    </div>
                  </InfoCard>
                )}
              </div>
            </div>
          )}

          <div className="section" style={{ "--i": si++ }}>
            <h2 data-ek="parish.s.gallery">Photo gallery</h2>
            <div className="sec-sub" data-ek="parish.s.gallery_caption">Images of the parish.</div>
            {admin && <div className="muted" style={{ fontSize: 12.5, marginTop: -4, marginBottom: 10 }}>Tip: click any frame below to upload a photo, or manage image links in the parish editor.</div>}
            <div className="gallery">
              <Frame church={c} target={{ kind: "image", idx: 0 }} src={c.images[0] || c.heroImage} label={c.gallery[0]} className="wide" admin={admin} />
              <Frame church={c} target={{ kind: "image", idx: 1 }} src={c.images[1]} label={c.gallery[1]} admin={admin} />
              <Frame church={c} target={{ kind: "image", idx: 2 }} src={c.images[2]} label={c.gallery[2]} admin={admin} />
              <Frame church={c} target={{ kind: "image", idx: 3 }} src={c.images[3]} label={c.gallery[3]} admin={admin} />
              <Frame church={c} target={{ kind: "image", idx: 4 }} src={c.images[4]} label={c.gallery[0] + " · detail"} admin={admin} />
              <Frame church={c} target={{ kind: "image", idx: 5 }} src={c.images[5]} label={c.gallery[3] + " · detail"} className="wide" admin={admin} />
            </div>
          </div>

          {clergyList.length > 0 && (
            <div className="section" style={{ "--i": si++ }}>
              <h2 data-ek="parish.s.clergy">Clergy</h2>
              <div className="sec-sub">Serving the parish community.</div>
              <div>
                {clergyList.map((p, i) => (
                  <div className="clergy-row" key={i}>
                    <div className="clergy-av">{window.initials(p.name)}</div>
                    <div>
                      <div className="cn">{p.name}</div>
                      <div className="ct">{p.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {c.events.length > 0 && (
            <div className="section" style={{ "--i": si++, marginBottom: 0 }}>
              <h2 data-ek="parish.s.events">Upcoming events</h2>
              <div className="sec-sub">Parish calendar highlights.</div>
              <div>
                {c.events.map((e, i) => {
                  const [mo, day] = (e.date || "").split(" ");
                  return (
                    <div className="event-row" key={i}>
                      <div className="event-date"><div className="ed-mo">{mo}</div><div className="ed-day">{day}</div></div>
                      <div style={{ flex: 1 }}>
                        <div className="ev-title">{e.title}</div>
                        <div className="ev-time"><window.I.clock style={{ width: 13, height: 13, verticalAlign: "-2px", marginRight: 4 }} />{e.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ---- sidebar ---- */}
        <aside className="cp-side">
          <div className="side-card">
            <h3 data-ek="parish.s.contact">Contact</h3>
            {hasContact ? (
              <React.Fragment>
                {ct.phone && <ContactRow icon={<window.I.phone />} k="Phone"><a className="v" href={"tel:" + ct.phone.replace(/\s/g, "")}>{ct.phone}</a></ContactRow>}
                {ct.email && <ContactRow icon={<window.I.mail />} k="Email"><a className="v" href={"mailto:" + ct.email}>{ct.email}</a></ContactRow>}
                {ct.website && <ContactRow icon={<window.I.globe />} k="Website"><a className="v" href={(/^https?:/.test(ct.website) ? "" : "https://") + ct.website} target="_blank" rel="noreferrer">{ct.website.replace(/^https?:\/\//, "")}</a></ContactRow>}
                {(c.address || c.poBox) && <ContactRow icon={<window.I.pin />} k="Address"><div className="v" style={{ fontWeight: 500 }}>{c.address || ("P.O. Box " + c.poBox)}</div></ContactRow>}
              </React.Fragment>
            ) : (
              <div className="muted" style={{ fontSize: 13.5 }}>No contact details on file yet.</div>
            )}
            <div className="side-actions">
              {dirUrl
                ? <a className="btn btn-primary" href={dirUrl} target="_blank" rel="noreferrer"><window.I.route /> Get directions</a>
                : <button className="btn btn-ghost" disabled style={{ opacity: .55, cursor: "default" }}><window.I.pin /> Location not set</button>}
              {mapsUrl && <a className="btn btn-ghost" href={mapsUrl} target="_blank" rel="noreferrer"><window.I.pin /> View on map</a>}
            </div>
          </div>

          <div className="side-card">
            <h3 data-ek="parish.s.office">Office hours</h3>
            {c.officeHours.length ? c.officeHours.map((o, i) => (
              <div className="ic-row" key={i} style={{ padding: "7px 0", borderBottom: i < c.officeHours.length - 1 ? "1px solid var(--line)" : "none", gap: 16 }}>
                <span style={{ color: "var(--ink-2)", flex: "none" }}>{o.days}</span>
                <span style={{ fontWeight: 600, textAlign: "right" }}>{o.hours}</span>
              </div>
            )) : <div className="muted" style={{ fontSize: 13.5 }}>Contact the parish office for hours.</div>}
          </div>

          {hasCoords && (
            <div className="side-card">
              <h3 data-ek="parish.s.location">Location</h3>
              <div className="side-map"><window.MiniMap church={c} /></div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>{c.diocese}</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { ChurchPage });
