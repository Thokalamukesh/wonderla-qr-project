"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, ImageOverlay, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { ParkMapPlace } from "../_lib/types";

const MAP_WIDTH = 1800;
const MAP_HEIGHT = 1381;
const pin = (color: string, emoji: string) => L.divIcon({
  className: "wonderla-map-pin-wrap",
  html: `<span style="background:${color}" class="wonderla-map-pin">${emoji}</span>`,
  iconSize: [34, 42],
  iconAnchor: [17, 38],
});
const destinationIcon = pin("#4f46e5", "★");
const startIcon = pin("#059669", "●");

type Point = { x: number; y: number };
const coords = (point: Point): [number, number] => [MAP_HEIGHT * (1 - point.y / 100), MAP_WIDTH * point.x / 100];

function MapTap({ active, onTap }: { active: boolean; onTap: (point: Point) => void }) {
  useMapEvents({ click(event) {
    if (active) onTap({ x: Math.max(0, Math.min(100, event.latlng.lng / MAP_WIDTH * 100)), y: Math.max(0, Math.min(100, (1 - event.latlng.lat / MAP_HEIGHT) * 100)) });
  } });
  return null;
}

function FollowLocation({ point, enabled }: { point: Point | null; enabled: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (enabled && point) map.setView(coords(point), map.getZoom(), { animate: true, duration: 0.5 });
  }, [enabled, map, point]);
  return null;
}

export default function InteractiveParkMap({ image, places, parkName }: { image: string; places: ParkMapPlace[]; parkName: string }) {
  const [destinationIndex, setDestinationIndex] = useState<number | null>(null);
  const [start, setStart] = useState<Point | null>(null);
  const [choosingStart, setChoosingStart] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [livePosition, setLivePosition] = useState<Point | null>(null);
  const [gpsMessage, setGpsMessage] = useState("");
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const gpsAnchor = useRef<{ latitude: number; longitude: number; point: Point } | null>(null);
  const validPlaces = places.filter((place) => Number.isFinite(place.x) && Number.isFinite(place.y));
  const destination = destinationIndex === null ? undefined : validPlaces[destinationIndex];
  const direction = useMemo(() => {
    const current = livePosition || start;
    return current && destination ? [coords(current), coords(destination)] as [number, number][] : [];
  }, [start, livePosition, destination]);
  const googleMapsUrl = destination && gpsCoordinates
    ? `https://www.google.com/maps/dir/?api=1&origin=${gpsCoordinates.latitude},${gpsCoordinates.longitude}&destination=${encodeURIComponent(`${destination.name}, ${parkName}`)}&travelmode=walking&dir_action=navigate`
    : "";

  useEffect(() => {
    if (!tracking) return;
    if (!navigator.geolocation) {
      setGpsMessage("This device or browser does not provide GPS location.");
      setTracking(false);
      return;
    }
    if (!start) {
      setGpsMessage("Tap your position on the map once to align the live GPS marker.");
      setTracking(false);
      return;
    }
    gpsAnchor.current = null;
    setGpsMessage("Waiting for GPS permission and location…");
    const watchId = navigator.geolocation.watchPosition(
      ({ coords: position }) => {
        setGpsCoordinates({ latitude: position.latitude, longitude: position.longitude });
        setGpsAccuracy(Math.round(position.accuracy));
        if (!gpsAnchor.current) {
          gpsAnchor.current = { latitude: position.latitude, longitude: position.longitude, point: start };
          setLivePosition(start);
          setGpsMessage("Live location on · keep this page open while walking.");
          return;
        }
        const anchor = gpsAnchor.current;
        const eastMeters = (position.longitude - anchor.longitude) * 111320 * Math.cos(position.latitude * Math.PI / 180);
        const northMeters = (position.latitude - anchor.latitude) * 110540;
        // Relative GPS movement keeps the guest's tapped position as the map anchor.
        // The illustrated floor plan itself does not contain GPS control points.
        setLivePosition({
          x: Math.max(0, Math.min(100, anchor.point.x + eastMeters / 650 * 100)),
          y: Math.max(0, Math.min(100, anchor.point.y - northMeters / 500 * 100)),
        });
        setGpsMessage(position.accuracy > 40 ? "GPS is updating, but accuracy is low here." : "Live location updating.");
      },
      (error) => {
        setGpsMessage(error.code === error.PERMISSION_DENIED ? "Location permission is off. Allow location access in your browser settings." : "Could not get GPS. Check signal and try again.");
        setTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 1500, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [tracking, start]);

  if (!validPlaces.length) return <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">This park map has no navigation destinations yet. Ask an admin to add map pins.</div>;

  return <section className="overflow-hidden rounded-2xl bg-white shadow-lg">
    <div className="space-y-3 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-extrabold text-indigo-700">1</span>
        <label className="block min-w-0 flex-1"><span className="mb-1 block text-sm font-bold text-slate-800">Where do you want to go?</span>
        <select aria-label="Choose a destination" value={destinationIndex ?? ""} onChange={(event) => setDestinationIndex(event.target.value === "" ? null : Number(event.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none">
          <option value="">Select a destination…</option>
          {validPlaces.map((place, index) => <option key={`${place.name}-${index}`} value={index}>{place.name} · {place.category}</option>)}
        </select>
        </label>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-700">2</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800">Where are you now?</p>
          <p className="text-xs text-slate-500">Tap your spot on the map once to line up live GPS.</p>
        </div>
        <button type="button" onClick={() => { setTracking(false); setLivePosition(null); setGpsCoordinates(null); setGpsAccuracy(null); setGpsMessage(""); setChoosingStart(true); }} className={`rounded-xl px-4 py-3 text-sm font-bold transition ${choosingStart ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"}`}>
          {choosingStart ? "Tap your spot on the map ↑" : start ? "📍 Change my spot" : "📍 Set my spot on map"}
        </button>
      </div>
      <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-600"><span className={`size-2.5 rounded-full ${tracking ? "animate-pulse bg-emerald-500" : "bg-slate-300"}`} /><span>{gpsMessage || (start ? "Ready to share live location" : "Set your spot first to start live updates")}</span>{gpsAccuracy !== null && tracking && <span className="whitespace-nowrap text-slate-500">±{gpsAccuracy} m</span>}</div>
        <button type="button" disabled={!start} onClick={() => setTracking((value) => !value)} className={`rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 ${tracking ? "bg-rose-50 text-rose-700 hover:bg-rose-100" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
          {tracking ? "Stop live location" : "📡 Start live location"}
        </button>
      </div>
    </div>
    <div className="relative h-[55vh] min-h-[340px] max-h-[620px] bg-slate-100">
      <MapContainer crs={L.CRS.Simple} bounds={[[0, 0], [MAP_HEIGHT, MAP_WIDTH]]} maxBounds={[[0, 0], [MAP_HEIGHT, MAP_WIDTH]]} maxBoundsViscosity={0.85} minZoom={-2} maxZoom={2} scrollWheelZoom className="h-full w-full">
        <ImageOverlay url={image} bounds={[[0, 0], [MAP_HEIGHT, MAP_WIDTH]]} />
        <MapTap active={choosingStart} onTap={(point) => { setStart(point); setChoosingStart(false); }} />
        <FollowLocation point={livePosition} enabled={tracking} />
        {destination && <Marker position={coords(destination)} icon={destinationIcon} />}
        {(livePosition || start) && <Marker position={coords(livePosition || start!)} icon={startIcon} />}
        {direction.length > 0 && <Polyline positions={direction as [number, number][]} pathOptions={{ color: "#4f46e5", weight: 5, dashArray: "8 8", opacity: 0.9 }} />}
      </MapContainer>
      {choosingStart && <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] rounded-xl bg-emerald-800/95 px-4 py-3 text-center text-sm font-bold text-white shadow">Tap the map where you are standing</div>}
      <div className="absolute bottom-3 left-3 z-[400] rounded-lg bg-white/95 px-3 py-2 text-[11px] font-semibold text-slate-600 shadow">🟢 You · ⭐ Destination · Use + / − to zoom</div>
    </div>
    <div className="p-4">
      {destination && <p className="font-semibold text-slate-800">{start ? <>Direction guide to <span className="text-indigo-700">{destination.name}</span></> : <>Selected: <span className="text-indigo-700">{destination.name}</span></>}</p>}
      {gpsMessage && <p role="status" aria-live="polite" className="mt-2 text-xs text-slate-600">{gpsMessage}</p>}
      {googleMapsUrl && <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#1a73e8] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1558b0]">🧭 Continue turn-by-turn in Google Maps <span aria-hidden="true">↗</span></a>}
      <p className="mt-2 text-xs leading-relaxed text-slate-500">Allow location access when asked. Keep this page open for live updates. GPS may drift indoors; the floor plan is not GPS-calibrated, and the dashed line is a direction guide rather than a verified walking route.</p>
      {googleMapsUrl && <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Google Maps opens on your device for live navigation. It may find the park or nearest matching attraction; turn-by-turn directions inside Wonderla depend on Google’s mapped paths and place data.</p>}
    </div>
  </section>;
}
