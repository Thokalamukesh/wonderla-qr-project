"use client";
import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Text, Num, Area, Toggle, Section, Row } from "./Fields";
import ImageField from "./ImageField";
import { DEFAULT_LANDING_ICONS } from "../../_lib/config.data";
import type {
  ParkConfig,
  MediaItem,
  EventItem,
  WaitTimeItem,
  WaveRainItem,
  SafetyItem,
  MaintenanceItem,
  DiningOutlet,
  MenuItem,
  GuidelineItem,
  LandingIcons,
  ParkMapPlace,
} from "../../_lib/types";

const EDITOR_SECTIONS = [
  ["🏞️", "Park details", "Name, location and logo"],
  ["🧭", "Park Map", "Map image and visitor zones"],
  ["🎢", "Rides", "Ride photos and descriptions"],
  ["🎭", "Events", "Show times and event details"],
  ["⏱️", "Live Ride Wait Times", "Update current queue estimates"],
  ["🌊", "Wave Pool & Rain Dance", "Session times and duration"],
  ["🛟", "Safety & Hygiene", "Guest safety information"],
  ["🔧", "Maintenance Log", "Service dates and checks"],
  ["📏", "Ride Guidelines", "Height limits and ride rules"],
  ["🍽️", "Dining & Menu", "Restaurants, dishes and prices"],
  ["✨", "Landing Tile Icons", "Choose icons for guest shortcuts"],
];

interface Props {
  config: ParkConfig;
  onSaved: (updated: ParkConfig) => void;
  onDeleted: (slug: string) => void;
  canManagePark?: boolean; // superadmin-only: delete + active flag
}

const ParkEditor = ({ config, onSaved, onDeleted, canManagePark = true }: Props) => {
  const [activeSection, setActiveSection] = useState("Park details");
  const [draft, setDraft] = useState<ParkConfig>(config);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const qrUrl = `${baseUrl}/qr-code/${draft.slug}`;
  useEffect(() => {
    if (!qrUrl || qrUrl.startsWith("/")) return;
    let active = true;
    QRCode.toDataURL(qrUrl, { width: 240, margin: 2, errorCorrectionLevel: "H" })
      .then((url) => { if (active) setQrImageUrl(url); })
      .catch(() => { if (active) setQrImageUrl(""); });
    return () => { active = false; };
  }, [qrUrl]);
  const downloadQr = () => {
    if (!qrImageUrl) return;
    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = `${draft.slug}-qr.png`;
    link.click();
  };

  useEffect(() => {
    setDraft(config);
    setMsg(null);
  }, [config]);

  // generic helpers over array sections
  function setField<K extends keyof ParkConfig>(key: K, value: ParkConfig[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function updateAt<T>(key: keyof ParkConfig, i: number, patch: Partial<T>) {
    setDraft((d) => {
      const arr = [...(d[key] as unknown as T[])];
      arr[i] = { ...(arr[i] as any), ...patch };
      return { ...d, [key]: arr } as ParkConfig;
    });
  }
  function addTo<T>(key: keyof ParkConfig, item: T) {
    setDraft((d) => ({ ...d, [key]: [...(d[key] as unknown as T[]), item] } as ParkConfig));
  }
  function removeAt(key: keyof ParkConfig, i: number) {
    setDraft((d) => {
      const arr = [...(d[key] as unknown as any[])];
      arr.splice(i, 1);
      return { ...d, [key]: arr } as ParkConfig;
    });
  }

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/qr-code/api/parks/${draft.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setMsg(json.error || "Save failed");
        return;
      }
      setMsg("Saved ✓");
      onSaved(json.config);
    } catch {
      setMsg("Network error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete park "${draft.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/qr-code/api/parks/${draft.slug}`, { method: "DELETE" });
    if (res.ok) onDeleted(draft.slug);
  };

  return (
    <div>
      <div className="sticky top-0 z-10 mb-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white/95 p-4 backdrop-blur">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{draft.name}</h2>
          <p className="text-xs text-slate-500">
            slug: <code>{draft.slug}</code> · QR URL:{" "}
            <code>/qr-code/{draft.slug}</code>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-xs font-semibold text-slate-600">{msg}</span>}
          {canManagePark && (
            <button
              type="button"
              onClick={remove}
              className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              Delete park
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      <section className="mb-6 flex flex-col items-center gap-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 text-center sm:flex-row sm:text-left">
        <div className="rounded-xl bg-white p-2 shadow-sm">
          {baseUrl && <img src={qrImageUrl} alt={`QR code for ${draft.name}`} width="144" height="144" className="block size-36" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-slate-800">📱 QR code for {draft.name}</h3>
          <p className="mt-1 text-sm text-slate-600">Guests who scan this code see this park’s latest saved map, rides, menus, wait times and information.</p>
          <p className="mt-2 break-all rounded-md bg-white px-3 py-2 text-xs text-indigo-700">{qrUrl || `/qr-code/${draft.slug}`}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            <button type="button" onClick={downloadQr} disabled={!baseUrl} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">⬇️ Download QR</button>
            <a href={`/qr-code/${draft.slug}`} target="_blank" rel="noreferrer" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">👁️ Preview park page</a>
          </div>
          <p className="mt-2 text-xs text-slate-500">Save your park changes to update the content guests see after scanning.</p>
        </div>
      </section>

      <section className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="text-sm font-bold text-emerald-900">✅ Content publishing</h3>
          <p className="mt-1 text-xs leading-relaxed text-emerald-800">Edit this park and choose <strong>Save changes</strong>. The QR code stays the same; guests then see the saved content when they scan it.</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-bold text-amber-900">✍️ Manual operations updates</h3>
          <p className="mt-1 text-xs leading-relaxed text-amber-800">Wait times and maintenance records are entered by park staff. No live ride-system connection is configured, so update these values here and save them.</p>
        </div>
      </section>

      <nav aria-label="Park content sections" className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-1 text-sm font-bold text-slate-800">🗂️ Park content</h3>
        <p className="mb-3 text-xs text-slate-500">Choose one section to edit. Other sections stay out of the way.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {EDITOR_SECTIONS.map(([icon, title, description]) => (
            <button key={title} type="button" aria-pressed={activeSection === title} onClick={() => setActiveSection(title)} className={`flex min-h-14 items-center gap-2 rounded-lg border p-2.5 text-left transition ${activeSection === title ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200" : "border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50"}`}>
              <span className="text-lg" aria-hidden="true">{icon}</span>
              <span className="min-w-0"><span className="block text-xs font-bold text-slate-700">{title}</span><span className="hidden text-[11px] text-slate-500 md:block">{description}</span></span>
            </button>
          ))}
        </div>
      </nav>

      {/* Park details */}
      <Section visible={activeSection === "Park details"} title="Park details">
        <div className="grid gap-3 md:grid-cols-2">
          <Text label="Name" value={draft.name} onChange={(v) => setField("name", v)} />
          <Text label="Location" value={draft.location} onChange={(v) => setField("location", v)} />
        </div>
        <div className="mt-3">
          <ImageField parkSlug={draft.slug}
            label="Logo image URL (blank = text wordmark)"
            value={draft.logoUrl || ""}
            onChange={(v) => setField("logoUrl", v)}
          />
        </div>
        <div className="mt-3">
          <ImageField parkSlug={draft.slug}
            label="Landing page hero image (optional; park map remains separate)"
            value={draft.heroImageUrl || ""}
            onChange={(v) => setField("heroImageUrl", v)}
          />
        </div>
        {canManagePark && (
          <div className="mt-3">
            <Toggle
              label="Active (visible in park list)"
              value={draft.active}
              onChange={(v) => setField("active", v)}
            />
          </div>
        )}
      </Section>

      {/* Landing tile icons */}
      <Section visible={activeSection === "Landing Tile Icons"} title="Landing Tile Icons">
        <p className="mb-3 text-xs text-slate-500">
          Paste any emoji (or short text) to use as each tile's icon.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {([
            ["parkMap", "Park Map"],
            ["ridesEvents", "Rides & Events"],
            ["dining", "Dining & Menu"],
            ["waitTimes", "Live Wait Times"],
            ["guidelines", "Ride Guidelines"],
            ["wavePool", "Wave Pool & Rain Dance"],
            ["safety", "Safety & Hygiene"],
            ["maintenance", "Maintenance Log"],
          ] as [keyof LandingIcons, string][]).map(([key, label]) => {
            const current = { ...DEFAULT_LANDING_ICONS, ...(draft.landingIcons || {}) };
            return (
              <Text
                key={key}
                label={label}
                value={current[key]}
                onChange={(v) =>
                  setField("landingIcons", { ...current, [key]: v })
                }
              />
            );
          })}
        </div>
      </Section>

      {/* Park Map */}
      <Section visible={activeSection === "Park Map"} title="Park Map">
        <div className="grid gap-3">
          <ImageField parkSlug={draft.slug}
            label="Map image URL"
            value={draft.parkMap.img}
            onChange={(v) => setField("parkMap", { ...draft.parkMap, img: v })}
          />
          <Area
            label="Description"
            value={draft.parkMap.description}
            onChange={(v) => setField("parkMap", { ...draft.parkMap, description: v })}
          />
        </div>
        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Zones</span>
            <button
              type="button"
              className="rounded-md bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
              onClick={() =>
                setField("parkMap", {
                  ...draft.parkMap,
                  zones: [...draft.parkMap.zones, { name: "", description: "" }],
                })
              }
            >
              + Add zone
            </button>
          </div>
          {draft.parkMap.zones.map((z, i) => (
            <Row
              key={i}
              onRemove={() =>
                setField("parkMap", {
                  ...draft.parkMap,
                  zones: draft.parkMap.zones.filter((_, j) => j !== i),
                })
              }
            >
              <Text
                label="Zone name"
                value={z.name}
                onChange={(v) => {
                  const zones = [...draft.parkMap.zones];
                  zones[i] = { ...zones[i], name: v };
                  setField("parkMap", { ...draft.parkMap, zones });
                }}
              />
              <Text
                label="Zone description"
                value={z.description}
                onChange={(v) => {
                  const zones = [...draft.parkMap.zones];
                  zones[i] = { ...zones[i], description: v };
                  setField("parkMap", { ...draft.parkMap, zones });
                }}
              />
            </Row>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div><h4 className="text-xs font-bold text-slate-700">📍 Map destinations</h4><p className="mt-1 text-[11px] text-slate-500">Set image coordinates as percentages from the top-left corner (0–100).</p></div>
            <button type="button" className="shrink-0 rounded-md bg-white px-3 py-2 text-xs font-semibold text-indigo-700 shadow-sm" onClick={() => setField("parkMap", { ...draft.parkMap, places: [...(draft.parkMap.places || []), { name: "", category: "Attraction", x: 50, y: 50 }] })}>+ Add pin</button>
          </div>
          {(draft.parkMap.places || []).map((place, i) => <Row key={`${place.name}-${i}`} onRemove={() => setField("parkMap", { ...draft.parkMap, places: draft.parkMap.places?.filter((_, index) => index !== i) || [] })}>
            <Text label="Destination name" value={place.name} onChange={(v) => { const places = [...(draft.parkMap.places || [])]; places[i] = { ...places[i], name: v }; setField("parkMap", { ...draft.parkMap, places }); }} />
            <div className="grid grid-cols-3 gap-2">
              <Text label="Category" value={place.category} onChange={(v) => { const places = [...(draft.parkMap.places || [])]; places[i] = { ...places[i], category: v }; setField("parkMap", { ...draft.parkMap, places }); }} />
              <Num label="X (%)" value={place.x} onChange={(v) => { const places = [...(draft.parkMap.places || [])]; places[i] = { ...places[i], x: Math.max(0, Math.min(100, v)) }; setField("parkMap", { ...draft.parkMap, places }); }} />
              <Num label="Y (%)" value={place.y} onChange={(v) => { const places = [...(draft.parkMap.places || [])]; places[i] = { ...places[i], y: Math.max(0, Math.min(100, v)) }; setField("parkMap", { ...draft.parkMap, places }); }} />
            </div>
          </Row>)}
        </div>
      </Section>

      {/* Rides */}
      <Section
        visible={activeSection === "Rides"}
        title="Rides"
        onAdd={() => addTo<MediaItem>("rides", { img: "", title: "", description: "" })}
        addLabel="+ Add ride"
      >
        {draft.rides.map((r, i) => (
          <Row key={i} onRemove={() => removeAt("rides", i)}>
            <Text label="Title" value={r.title} onChange={(v) => updateAt<MediaItem>("rides", i, { title: v })} />
            <ImageField parkSlug={draft.slug} label="Ride image" value={r.img} onChange={(v) => updateAt<MediaItem>("rides", i, { img: v })} />
            <Area label="Description" value={r.description} onChange={(v) => updateAt<MediaItem>("rides", i, { description: v })} />
            <Text label="Tags (comma separated)" value={(r.tags || []).join(", ")} onChange={(v) => updateAt<MediaItem>("rides", i, { tags: v.split(",").map((x) => x.trim()).filter(Boolean) })} />
          </Row>
        ))}
      </Section>

      {/* Events */}
      <Section
        visible={activeSection === "Events"}
        title="Events"
        onAdd={() => addTo<EventItem>("events", { img: "", time: "", title: "", description: "" })}
        addLabel="+ Add event"
      >
        {draft.events.map((ev, i) => (
          <Row key={i} onRemove={() => removeAt("events", i)}>
            <Text label="Title" value={ev.title} onChange={(v) => updateAt<EventItem>("events", i, { title: v })} />
            <Text label="Time" value={ev.time} onChange={(v) => updateAt<EventItem>("events", i, { time: v })} />
            <ImageField parkSlug={draft.slug} label="Event image" value={ev.img} onChange={(v) => updateAt<EventItem>("events", i, { img: v })} />
            <Area label="Description" value={ev.description} onChange={(v) => updateAt<EventItem>("events", i, { description: v })} />
            <Text label="Tags (comma separated)" value={(ev.tags || []).join(", ")} onChange={(v) => updateAt<EventItem>("events", i, { tags: v.split(",").map((x) => x.trim()).filter(Boolean) })} />
          </Row>
        ))}
      </Section>

      {/* Live wait times */}
      <Section
        visible={activeSection === "Live Ride Wait Times"}
        title="Live Ride Wait Times"
        onAdd={() => addTo<WaitTimeItem>("liveWaitTimes", { img: "", title: "", description: "", time: 0 })}
        addLabel="+ Add ride"
      >
        {draft.liveWaitTimes.map((w, i) => (
          <Row key={i} onRemove={() => removeAt("liveWaitTimes", i)}>
            <Text label="Title" value={w.title} onChange={(v) => updateAt<WaitTimeItem>("liveWaitTimes", i, { title: v })} />
            <Num label="Wait (mins)" value={w.time} onChange={(v) => updateAt<WaitTimeItem>("liveWaitTimes", i, { time: v })} />
            <ImageField parkSlug={draft.slug} label="Ride image" value={w.img} onChange={(v) => updateAt<WaitTimeItem>("liveWaitTimes", i, { img: v })} />
            <Area label="Description" value={w.description} onChange={(v) => updateAt<WaitTimeItem>("liveWaitTimes", i, { description: v })} />
          </Row>
        ))}
      </Section>

      {/* Wave pool & rain dance */}
      <Section
        visible={activeSection === "Wave Pool & Rain Dance"}
        title="Wave Pool & Rain Dance"
        onAdd={() => addTo<WaveRainItem>("waveRainDance", { img: "", title: "", timeSlot: [], rideDuration: 0 })}
        addLabel="+ Add activity"
      >
        {draft.waveRainDance.map((w, i) => (
          <Row key={i} onRemove={() => removeAt("waveRainDance", i)}>
            <Text label="Title" value={w.title} onChange={(v) => updateAt<WaveRainItem>("waveRainDance", i, { title: v })} />
            <ImageField parkSlug={draft.slug} label="Activity image" value={w.img} onChange={(v) => updateAt<WaveRainItem>("waveRainDance", i, { img: v })} />
            <Num label="Duration (mins)" value={w.rideDuration} onChange={(v) => updateAt<WaveRainItem>("waveRainDance", i, { rideDuration: v })} />
            <Text
              label="Time slots (comma separated)"
              value={w.timeSlot.join(", ")}
              onChange={(v) =>
                updateAt<WaveRainItem>("waveRainDance", i, {
                  timeSlot: v.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
            />
          </Row>
        ))}
      </Section>

      {/* Safety & hygiene */}
      <Section
        visible={activeSection === "Safety & Hygiene"}
        title="Safety & Hygiene"
        onAdd={() => addTo<SafetyItem>("safetyHygiene", { img: "", title: "", description: "" })}
        addLabel="+ Add item"
      >
        {draft.safetyHygiene.map((s, i) => (
          <Row key={i} onRemove={() => removeAt("safetyHygiene", i)}>
            <Text label="Title" value={s.title} onChange={(v) => updateAt<SafetyItem>("safetyHygiene", i, { title: v })} />
            <ImageField parkSlug={draft.slug} label="Safety image" value={s.img} onChange={(v) => updateAt<SafetyItem>("safetyHygiene", i, { img: v })} />
            <Area label="Description" value={s.description} onChange={(v) => updateAt<SafetyItem>("safetyHygiene", i, { description: v })} />
          </Row>
        ))}
      </Section>

      {/* Maintenance log */}
      <Section
        visible={activeSection === "Maintenance Log"}
        title="Maintenance Log"
        onAdd={() => addTo<MaintenanceItem>("maintenanceLog", { ride: "", lastService: "", checks: "" })}
        addLabel="+ Add row"
      >
        {draft.maintenanceLog.map((m, i) => (
          <Row key={i} onRemove={() => removeAt("maintenanceLog", i)}>
            <Text label="Ride" value={m.ride} onChange={(v) => updateAt<MaintenanceItem>("maintenanceLog", i, { ride: v })} />
            <Text label="Last service (dd/mm/yyyy)" value={m.lastService} onChange={(v) => updateAt<MaintenanceItem>("maintenanceLog", i, { lastService: v })} />
            <Text label="Checks" value={m.checks} onChange={(v) => updateAt<MaintenanceItem>("maintenanceLog", i, { checks: v })} />
          </Row>
        ))}
      </Section>

      {/* Ride guidelines */}
      <Section
        visible={activeSection === "Ride Guidelines"}
        title="Ride Guidelines"
        onAdd={() => addTo<GuidelineItem>("rideGuidelines", { title: "", description: "", minHeight: "" })}
        addLabel="+ Add guideline"
      >
        {draft.rideGuidelines.map((g, i) => (
          <Row key={i} onRemove={() => removeAt("rideGuidelines", i)}>
            <Text label="Title" value={g.title} onChange={(v) => updateAt<GuidelineItem>("rideGuidelines", i, { title: v })} />
            <Text label="Min height (optional)" value={g.minHeight || ""} onChange={(v) => updateAt<GuidelineItem>("rideGuidelines", i, { minHeight: v })} />
            <Area label="Description" value={g.description} onChange={(v) => updateAt<GuidelineItem>("rideGuidelines", i, { description: v })} />
          </Row>
        ))}
      </Section>

      {/* Dining */}
      <Section
        visible={activeSection === "Dining & Menu"}
        title="Dining & Menu"
        onAdd={() => addTo<DiningOutlet>("dining", { img: "", name: "", cuisine: "", items: [] })}
        addLabel="+ Add outlet"
      >
        {draft.dining.map((o, i) => (
          <Row key={i} onRemove={() => removeAt("dining", i)}>
            <Text label="Outlet name" value={o.name} onChange={(v) => updateAt<DiningOutlet>("dining", i, { name: v })} />
            <Text label="Cuisine" value={o.cuisine} onChange={(v) => updateAt<DiningOutlet>("dining", i, { cuisine: v })} />
            <ImageField parkSlug={draft.slug} label="Restaurant image" value={o.img} onChange={(v) => updateAt<DiningOutlet>("dining", i, { img: v })} />
            <Area label="Description" value={o.description || ""} onChange={(v) => updateAt<DiningOutlet>("dining", i, { description: v })} />
            <Text label="Directions URL (optional)" value={o.directionsUrl || ""} onChange={(v) => updateAt<DiningOutlet>("dining", i, { directionsUrl: v })} />
            <Text label="Tags (comma separated)" value={(o.tags || []).join(", ")} onChange={(v) => updateAt<DiningOutlet>("dining", i, { tags: v.split(",").map((x) => x.trim()).filter(Boolean) })} />

            <div className="mt-1 rounded-md border border-slate-200 bg-white p-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Menu items</span>
                <button
                  type="button"
                  className="rounded bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700"
                  onClick={() => {
                    const items: MenuItem[] = [...o.items, { name: "", price: "", veg: true, img: "" }];
                    updateAt<DiningOutlet>("dining", i, { items });
                  }}
                >
                  + Add item
                </button>
              </div>
              {o.items.map((it, j) => (
                <div key={j} className="mb-2 rounded-md border border-slate-200 bg-slate-50 p-2">
                  <div className="grid grid-cols-[1fr_90px_60px_auto] items-center gap-2">
                    <input
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                      placeholder="Item name"
                      value={it.name}
                      onChange={(e) => {
                        const items = [...o.items];
                        items[j] = { ...items[j], name: e.target.value };
                        updateAt<DiningOutlet>("dining", i, { items });
                      }}
                    />
                    <input
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                      placeholder="Price"
                      value={it.price}
                      onChange={(e) => {
                        const items = [...o.items];
                        items[j] = { ...items[j], price: e.target.value };
                        updateAt<DiningOutlet>("dining", i, { items });
                      }}
                    />
                    <label className="flex items-center gap-1 text-[11px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={it.veg}
                        onChange={(e) => {
                          const items = [...o.items];
                          items[j] = { ...items[j], veg: e.target.checked };
                          updateAt<DiningOutlet>("dining", i, { items });
                        }}
                      />
                      Veg
                    </label>
                    <button
                      type="button"
                      className="text-[11px] font-semibold text-red-600"
                      onClick={() => {
                        const items = o.items.filter((_, k) => k !== j);
                        updateAt<DiningOutlet>("dining", i, { items });
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2">
                  <ImageField parkSlug={draft.slug}
                    label="Dish image (optional)"
                    value={it.img || ""}
                    onChange={(v) => {
                      const items = [...o.items];
                      items[j] = { ...items[j], img: v };
                      updateAt<DiningOutlet>("dining", i, { items });
                    }}
                  />
                  </div>
                </div>
              ))}
            </div>
          </Row>
        ))}
      </Section>
    </div>
  );
};

export default ParkEditor;
