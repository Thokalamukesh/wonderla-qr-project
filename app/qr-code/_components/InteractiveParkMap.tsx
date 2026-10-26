"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { ParkMapPlace } from "../_lib/types";

const WONDERLA: L.LatLngExpression = [12.8343, 77.401];
const WONDERLA_LINK = "https://www.google.com/maps/dir/?api=1&destination=12.8343%2C77.401&travelmode=driving&dir_action=navigate";

type LiveLocation = { lat: number; lng: number; accuracy: number };

const parkIcon = L.divIcon({
  className: "wonderla-map-marker",
  html: '<span class="wonderla-map-marker__pin"><b>W</b></span>',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

const userIcon = L.divIcon({
  className: "wonderla-user-marker",
  html: '<span class="wonderla-user-marker__dot"><span></span></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function distanceInKm(from: LiveLocation, to: { lat: number; lng: number }) {
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

function MapController({
  userLocation,
  recenterRequest,
}: {
  userLocation: LiveLocation | null;
  recenterRequest: number;
}) {
  const map = useMap();
  const hasCenteredOnInitialLocation = useRef(false);

  useEffect(() => {
    if (!userLocation || hasCenteredOnInitialLocation.current) return;
    hasCenteredOnInitialLocation.current = true;
    map.panTo([userLocation.lat, userLocation.lng]);
  }, [map, userLocation]);

  useEffect(() => {
    if (recenterRequest === 0) return;
    if (userLocation) {
      map.panTo([userLocation.lat, userLocation.lng]);
    } else {
      map.panTo(WONDERLA);
    }
  }, [map, recenterRequest, userLocation]);

  return null;
}

interface Props {
  parkName?: string;
  places?: ParkMapPlace[];
}

export default function InteractiveParkMap({ parkName = "Wonderla Bengaluru", places = [] }: Props) {
  const [userLocation, setUserLocation] = useState<LiveLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState("Finding your live location…");
  const [recenterRequest, setRecenterRequest] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [mapTileError, setMapTileError] = useState(false);

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

  const centerOnUser = useCallback(() => {
    setRecenterRequest((request) => request + 1);
  }, []);

  const distance = userLocation
    ? distanceInKm(userLocation, { lat: 12.8343, lng: 77.401 })
    : null;

  return (
    <section className="grid h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_minmax(0,1fr)] overflow-hidden bg-white lg:grid-cols-2 lg:grid-rows-1">
      <div className="relative z-0 min-h-0 overflow-hidden bg-[#e9eef0]">
        <MapContainer
          center={WONDERLA}
          zoom={15}
          zoomControl={false}
          scrollWheelZoom
          className="h-full w-full"
          aria-label="Map showing your live location and Wonderla Bengaluru"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            eventHandlers={{
              load: () => {
                setMapReady(true);
                setMapTileError(false);
              },
              tileerror: () => setMapTileError(true),
            }}
          />
          <Marker position={WONDERLA} icon={parkIcon} title={parkName} />
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
              title="Your live location"
            />
          )}
          <MapController userLocation={userLocation} recenterRequest={recenterRequest} />
        </MapContainer>

        <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-2xl bg-white px-4 py-3 shadow-lg">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#757575]">Wonderla park</p>
          <p className="mt-0.5 text-sm font-extrabold text-[#191919]">{parkName}</p>
          <p className="mt-1 text-xs text-[#676767]">12.8343° N · 77.4010° E</p>
        </div>

        <button
          type="button"
          onClick={centerOnUser}
          className="absolute bottom-5 right-4 z-[500] flex size-12 items-center justify-center rounded-full bg-white text-xl text-[#191919] shadow-lg transition hover:bg-[#fff9dc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c400]"
          aria-label="Center map on my location"
          title="Center map on my location"
        >
          ◎
        </button>

        <div className="absolute bottom-4 left-3 z-[500] flex items-center gap-3 rounded-full bg-white px-3 py-2 text-[11px] font-bold text-[#454545] shadow-md">
          <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-[#2674e8]" />You</span>
          <span className="flex items-center gap-1.5"><i className="flex size-4 items-center justify-center rounded-full bg-[#f5c400] text-[9px] not-italic text-black">W</i>Wonderla</span>
        </div>

        {!mapReady && !mapTileError && (
          <div className="pointer-events-none absolute bottom-16 left-3 z-[500] rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-[#555] shadow">
            Loading map…
          </div>
        )}
        {mapTileError && (
          <div className="pointer-events-none absolute bottom-16 left-3 z-[500] rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-[#555] shadow">
            Some map tiles could not load. Check your connection.
          </div>
        )}
      </div>

      <aside className="relative z-10 min-h-0 overflow-y-auto overscroll-contain rounded-t-[28px] border-t border-[#eeeeee] bg-white px-5 pb-6 pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] lg:rounded-none lg:border-l lg:border-t-0 lg:px-6 lg:pt-6 lg:shadow-none">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#d8d8d8] lg:hidden" aria-hidden="true" />
        <div className="mx-auto max-w-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#a27d00]">Your park trip</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#191919]">Where to?</h1>
            </div>
            <span className="rounded-full bg-[#fff5c2] px-3 py-1.5 text-xs font-extrabold text-[#705900]">{places.length} places</span>
          </div>

          <div className="mt-4 rounded-2xl border border-[#e8e8e8] bg-[#f7f7f7] px-4 py-3">
            <p className="text-xs font-semibold text-[#777]">Destination</p>
            <p className="mt-1 font-extrabold text-[#191919]">{parkName}</p>
          </div>

          <div className="mt-4 space-y-3">
            <article className="flex items-center gap-3 rounded-2xl border border-[#ededed] p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eaf2ff] text-lg text-[#2674e8]">●</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-bold text-[#191919]">Your location</h2>
                  <span className={`size-2.5 shrink-0 rounded-full ${userLocation ? "bg-emerald-500" : "bg-amber-400"}`} />
                </div>
                <p className="mt-1 text-sm text-[#777]">{locationStatus}</p>
                {userLocation && (
                  <p className="mt-1.5 text-xs text-[#8a8a8a]">
                    {formatCoordinate(userLocation.lat, "N")}, {formatCoordinate(userLocation.lng, "E")} · ±{Math.round(userLocation.accuracy)} m
                  </p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-[#f0dc77] bg-[#fffdf3] p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f5c400] font-extrabold text-[#191919]">W</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-extrabold text-[#191919]">{parkName}</h2>
                      <p className="mt-1 text-sm text-[#777]">Mysore Road, Bengaluru</p>
                    </div>
                    {distance !== null && (
                      <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-[#555]">
                        {distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-[#858585]">12.8343° N, 77.4010° E</p>
                </div>
              </div>
              <a
                href={WONDERLA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#f5c400] px-4 py-3 text-sm font-extrabold text-[#191919] transition hover:bg-[#e9b900] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd9700]"
              >
                Navigate with Google Maps <span className="ml-2" aria-hidden="true">↗</span>
              </a>
            </article>
          </div>

          <section className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-base font-extrabold text-[#191919]">Available in the park</h2>
              <span className="text-xs font-semibold text-[#858585]">Tap a place</span>
            </div>
            {places.length ? (
              <div className="space-y-2">
                {places.map((place) => (
                  <a
                    key={`${place.name}-${place.category}`}
                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(parkName)}&destination=${encodeURIComponent(`${place.name}, ${parkName}`)}&travelmode=walking&dir_action=navigate`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-[#ededed] bg-white px-3 py-2.5 text-left transition hover:border-[#e4bd00] hover:bg-[#fffdf3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd9700]"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fff5c2] text-sm font-extrabold text-[#604d00]">{place.name.slice(0, 1)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-[#222]">{place.name}</span>
                      <span className="mt-0.5 block text-xs text-[#858585]">{place.category}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-[#f5c400] px-2.5 py-1 text-[11px] font-extrabold text-[#191919]">Go ↗</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-[#f7f7f7] p-3 text-sm text-[#777]">Park locations have not been added yet.</p>
            )}
          </section>

          <p className="mt-4 text-center text-xs leading-relaxed text-[#888]">
            {mapReady ? "Map ready · OpenStreetMap" : mapTileError ? "Map tiles are having trouble loading" : "Loading map tiles…"}
          </p>
        </div>
      </aside>
    </section>
  );
}
