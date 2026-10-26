"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

const WONDERLA: google.maps.LatLngLiteral = { lat: 12.8343, lng: 77.401 };
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

declare global {
  interface Window {
    google?: typeof google;
  }
}

let mapsScriptPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (mapsScriptPromise) return mapsScriptPromise;

  mapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      mapsScriptPromise = null;
      reject(new Error("Google Maps could not be loaded. Check the API key and Maps JavaScript API settings."));
    };
    document.head.appendChild(script);
  });

  return mapsScriptPromise;
}

type LiveLocation = { lat: number; lng: number; accuracy: number };

function distanceInKm(from: google.maps.LatLngLiteral, to: google.maps.LatLngLiteral) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = radians(to.lat - from.lat);
  const longitudeDelta = radians(to.lng - from.lng);
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function formatCoordinate(value: number, direction: "N" | "S" | "E" | "W") {
  return `${Math.abs(value).toFixed(5)}° ${value < 0 ? (direction === "N" ? "S" : "W") : direction}`;
}

interface Props {
  parkName?: string;
}

export default function InteractiveParkMap({ parkName = "Wonderla Bengaluru" }: Props) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const userMarker = useRef<google.maps.Marker | null>(null);
  const hasFittedLiveLocation = useRef(false);
  const [userLocation, setUserLocation] = useState<LiveLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState("Finding your live location…");
  const [mapStatus, setMapStatus] = useState("Loading Google Maps…");
  const [mapError, setMapError] = useState("");
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!API_KEY) {
      setMapError("Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to the app environment to display the map.");
      return;
    }

    let active = true;
    loadGoogleMaps(API_KEY)
      .then(() => {
        if (!active || !mapElement.current || !window.google) return;
        const map = new window.google.maps.Map(mapElement.current, {
          center: WONDERLA,
          zoom: 14,
          mapTypeId: "roadmap",
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: "greedy",
        });
        mapInstance.current = map;
        new window.google.maps.Marker({
          map,
          position: WONDERLA,
          title: "Wonderla Bengaluru",
          label: { text: "W", color: "#ffffff", fontWeight: "700" },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#e11d48",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
            scale: 16,
          },
        });
        setMapStatus("Google Maps ready");
        setMapReady(true);
      })
      .catch((error: unknown) => {
        if (active) setMapError(error instanceof Error ? error.message : "Google Maps could not be loaded.");
      });

    return () => {
      active = false;
      mapInstance.current = null;
      userMarker.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Live location is not available in this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy });
        setLocationStatus("Live location active");
      },
      (error) => {
        setLocationStatus(error.code === error.PERMISSION_DENIED
          ? "Allow location access to show your position."
          : "Could not get your location. Check location services.");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    const maps = window.google?.maps;
    if (!map || !maps || !userLocation) return;

    const position = { lat: userLocation.lat, lng: userLocation.lng };
    if (!userMarker.current) {
      userMarker.current = new maps.Marker({
        map,
        position,
        title: "Your live location",
        icon: {
          path: maps.SymbolPath.CIRCLE,
          fillColor: "#2563eb",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
          scale: 9,
        },
      });
    } else {
      userMarker.current.setPosition(position);
    }

    if (!hasFittedLiveLocation.current) {
      hasFittedLiveLocation.current = true;
      const bounds = new maps.LatLngBounds();
      bounds.extend(WONDERLA);
      bounds.extend(position);
      map.fitBounds(bounds, 72);
    }
  }, [mapReady, userLocation]);

  const centerOnUser = useCallback(() => {
    const map = mapInstance.current;
    if (!map) return;
    if (userLocation) {
      map.panTo({ lat: userLocation.lat, lng: userLocation.lng });
      map.setZoom(16);
    } else {
      map.panTo(WONDERLA);
      map.setZoom(14);
    }
  }, [userLocation]);

  const distance = userLocation ? distanceInKm(userLocation, WONDERLA) : null;

  return (
    <section className="grid h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_minmax(0,1fr)] overflow-hidden rounded-2xl bg-white shadow-lg lg:grid-cols-2 lg:grid-rows-1">
      <div className="relative min-h-0 bg-slate-100">
        <div ref={mapElement} className="absolute inset-0" aria-label="Google map showing your live location and Wonderla Bengaluru" />
        {mapError ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50 p-6 text-center">
            <div className="max-w-sm">
              <p className="font-bold text-slate-800">Google Map unavailable</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{mapError}</p>
              <p className="mt-2 text-xs text-slate-500">Confirm the Maps JavaScript API is enabled and this site is allowed by the key’s website restrictions.</p>
            </div>
          </div>
        ) : !mapReady ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-slate-600">{mapStatus}</div>
        ) : null}

        <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-xl bg-white/95 px-3 py-2 shadow-md">
          <p className="text-sm font-bold text-slate-900">{parkName}</p>
          <p className="mt-0.5 text-xs text-slate-500">12.8343° N, 77.4010° E</p>
        </div>
        <button
          type="button"
          onClick={centerOnUser}
          className="absolute bottom-4 right-4 z-20 flex size-12 items-center justify-center rounded-full bg-white text-xl text-slate-800 shadow-lg hover:bg-slate-50"
          aria-label="Center map on my location"
          title="Center map on my location"
        >
          ◎
        </button>
        <div className="absolute bottom-3 left-3 z-20 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-md">
          <span className="mr-2 inline-block size-2.5 rounded-full bg-blue-500" />You
          <span className="mx-2 text-slate-300">•</span>
          <span className="mr-1 text-rose-600">●</span>Wonderla
        </div>
      </div>

      <aside className="min-h-0 overflow-y-auto border-t border-slate-100 p-4 sm:p-6 lg:border-l lg:border-t-0">
        <div className="mx-auto max-w-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Location overview</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Where are you going?</h1>
            </div>
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">2 locations</span>
          </div>

          <div className="mt-5 space-y-3">
            <article className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">●</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-bold text-slate-900">Your live location</h2>
                    <span className={`size-2.5 shrink-0 rounded-full ${userLocation ? "bg-emerald-500" : "bg-amber-500"}`} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{locationStatus}</p>
                  {userLocation && <p className="mt-2 text-xs text-slate-400">{formatCoordinate(userLocation.lat, "N")}, {formatCoordinate(userLocation.lng, "E")} · ±{Math.round(userLocation.accuracy)} m</p>}
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-100 font-bold text-rose-600">W</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-bold text-slate-900">{parkName}</h2>
                      <p className="mt-1 text-sm text-slate-500">Mysore Road, Bengaluru</p>
                    </div>
                    {distance !== null && <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-indigo-700">{distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}</span>}
                  </div>
                  <p className="mt-3 text-xs text-slate-400">12.8343° N, 77.4010° E</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${WONDERLA.lat}%2C${WONDERLA.lng}&travelmode=driving&dir_action=navigate`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Navigate with Google Maps
                  </a>
                </div>
              </div>
            </article>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-800">Map status</p>
                <p className="mt-1 text-xs text-slate-500">{mapError ? "Check Google Maps API configuration" : mapStatus}</p>
              </div>
              <span className={`size-2.5 rounded-full ${mapError ? "bg-rose-500" : mapReady ? "bg-emerald-500" : "bg-amber-500"}`} />
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
