"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  CircleMarker,
  ImageOverlay,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import type { ParkMapPlace } from "../_lib/types";

const WONDERLA: L.LatLngExpression = [12.8343, 77.401];
const PARK_LAYOUT_IMAGE = "/wonderla/parks/bengaluru-layout.jpg";
const IMAGE_HEIGHT_TO_WIDTH = 1381 / 1800;
const PARK_LAYOUT_BOUNDS: L.LatLngBoundsExpression = [[0, 0], [100 * IMAGE_HEIGHT_TO_WIDTH, 100]];
type MapPoint = [number, number];

// Waypoints are percent positions on the Bengaluru park layout image (x, y).
// Each route begins at the park's marked Entrance / Exit (#2).
const WALKING_ROUTES: Record<string, MapPoint[]> = {
  "Entrance / Exit": [[24, 30]],
  "Park View Restaurant": [[24, 30], [22, 30], [20, 29], [17, 28], [11, 27]],
  "Food Court": [[24, 30], [26, 30], [28, 28], [29, 24]],
  "Wonderla Bamba": [[24, 30], [27, 31], [29, 30], [31, 28], [33, 27]],
  Recoil: [[24, 30], [31, 32], [38, 34], [44, 32], [50, 29], [57, 28], [64, 29], [71, 31], [77, 30]],
  "Wave Pool": [[24, 30], [22, 34], [21, 38], [19, 42], [17, 46]],
  "Lazy River": [[24, 30], [29, 32], [34, 36], [39, 41], [43, 46], [47, 51], [49, 57]],
  "Drop Loop": [[24, 30], [29, 30], [34, 30], [39, 29], [44, 28], [48, 29]],
  Harakiri: [[24, 30], [30, 32], [36, 36], [42, 40], [47, 45], [51, 50], [55, 56], [58, 61]],
  Boomerang: [[24, 30], [30, 32], [36, 36], [42, 40], [47, 45], [52, 50], [56, 55], [58, 58]],
  "First Aid": [[24, 30], [29, 31], [34, 33], [39, 35], [44, 36], [48, 37]],
  "Dome Plaza": [[24, 30], [27, 30], [29, 29], [31, 29]],
};

const userIcon = L.divIcon({
  className: "wonderla-user-marker",
  html: '<span class="wonderla-user-marker__dot"><span></span></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

type LiveLocation = { lat: number; lng: number; accuracy: number };

function formatCoordinate(value: number, direction: "N" | "S" | "E" | "W") {
  return `${Math.abs(value).toFixed(5)}° ${value < 0 ? (direction === "N" ? "S" : "W") : direction}`;
}

function distanceInKm(from: LiveLocation, to: { lat: number; lng: number }) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = radians(to.lat - from.lat);
  const longitudeDelta = radians(to.lng - from.lng);
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function LiveMapController({
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
    map.panTo(userLocation ? [userLocation.lat, userLocation.lng] : WONDERLA);
  }, [map, recenterRequest, userLocation]);

  return null;
}

function ParkRouteLayers({ place, route }: { place: ParkMapPlace; route: MapPoint[] }) {
  const map = useMap();
  const routePositions = route.map(([x, y]) => [(100 - y) * IMAGE_HEIGHT_TO_WIDTH, x] as [number, number]);
  const destination: L.LatLngExpression = [(100 - place.y) * IMAGE_HEIGHT_TO_WIDTH, place.x];
  const entrance: L.LatLngExpression = [(100 - 30) * IMAGE_HEIGHT_TO_WIDTH, 24];

  useEffect(() => {
    map.fitBounds(PARK_LAYOUT_BOUNDS, { padding: [8, 8] });
  }, [map]);

  return (
    <>
      <ImageOverlay url={PARK_LAYOUT_IMAGE} bounds={PARK_LAYOUT_BOUNDS} />
      <Polyline
        positions={routePositions}
        pathOptions={{ color: "#1673e8", weight: 7, opacity: 0.92, lineCap: "round", lineJoin: "round" }}
      />
      <CircleMarker center={entrance} radius={8} pathOptions={{ color: "#fff", weight: 3, fillColor: "#202020", fillOpacity: 1 }} />
      <CircleMarker center={destination} radius={9} pathOptions={{ color: "#fff", weight: 3, fillColor: "#1673e8", fillOpacity: 1 }} />
    </>
  );
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
  const [activeDestination, setActiveDestination] = useState<ParkMapPlace | null>(null);

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

  const showRoute = useCallback((place: ParkMapPlace) => {
    if (parkName.toLowerCase().includes("bengaluru") && WALKING_ROUTES[place.name]) {
      setActiveDestination(place);
    }
  }, [parkName]);

  const activeRoute = activeDestination ? WALKING_ROUTES[activeDestination.name] : null;
  const distance = userLocation ? distanceInKm(userLocation, { lat: 12.8343, lng: 77.401 }) : null;

  return (
    <section className="grid h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_minmax(0,1fr)] overflow-hidden bg-white lg:grid-cols-2 lg:grid-rows-1">
      <div className="relative z-0 min-h-0 overflow-hidden bg-[#e9eef0]">
        {activeDestination && activeRoute ? (
          <MapContainer
            key={`park-route-${activeDestination.name}`}
            center={[38, 50]}
            zoom={-5}
            minZoom={-9}
            maxZoom={4}
            crs={L.CRS.Simple}
            zoomControl={false}
            scrollWheelZoom
            className="h-full w-full bg-[#eef0e4]"
          >
            <ZoomControl position="bottomright" />
            <ParkRouteLayers place={activeDestination} route={activeRoute} />
          </MapContainer>
        ) : (
          <MapContainer
            center={WONDERLA}
            zoom={15}
            zoomControl={false}
            scrollWheelZoom
            className="h-full w-full"
            aria-label="Map showing your live location"
          >
            <ZoomControl position="topright" />
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
            {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} title="Your live location" />}
            <LiveMapController userLocation={userLocation} recenterRequest={recenterRequest} />
          </MapContainer>
        )}

        {activeDestination ? (
          <div className="absolute left-3 right-3 top-3 z-[500] flex items-center gap-2 rounded-2xl bg-white/95 p-2.5 shadow-lg backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setActiveDestination(null)}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f3f3f3] text-lg font-bold text-[#191919]"
              aria-label="Return to live map"
            >
              ←
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#727272]">Walking route · Start at Entrance / Exit</p>
              <p className="truncate text-sm font-extrabold text-[#191919]">{activeDestination.name}</p>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={centerOnUser}
              className="absolute bottom-5 right-4 z-[500] flex size-12 items-center justify-center rounded-full bg-white text-xl text-[#191919] shadow-lg transition hover:bg-[#f5f5f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1673e8]"
              aria-label="Center map on my location"
              title="Center map on my location"
            >
              ◎
            </button>
            <div className="absolute bottom-4 left-3 z-[500] flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11px] font-bold text-[#454545] shadow-md">
              <i className="size-2.5 rounded-full bg-[#2674e8]" />Your location
            </div>
          </>
        )}

        {!activeDestination && !mapReady && !mapTileError && (
          <div className="pointer-events-none absolute bottom-16 left-3 z-[500] rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-[#555] shadow">
            Loading map…
          </div>
        )}
        {!activeDestination && mapTileError && (
          <div className="pointer-events-none absolute bottom-16 left-3 z-[500] rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-[#555] shadow">
            Some map tiles could not load. Check your connection.
          </div>
        )}
      </div>

      <aside className="relative z-10 min-h-0 overflow-y-auto overscroll-contain rounded-t-[28px] border-t border-[#eeeeee] bg-white px-4 pb-5 pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] lg:rounded-none lg:border-l lg:border-t-0 lg:px-5 lg:pt-5 lg:shadow-none">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#d8d8d8] lg:hidden" aria-hidden="true" />
        <div className="mx-auto max-w-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#927100]">Explore Wonderla</p>
              <h1 className="mt-0.5 text-xl font-extrabold tracking-tight text-[#191919]">Available in the park</h1>
            </div>
            <span className="rounded-full bg-[#fff5c2] px-3 py-1.5 text-xs font-extrabold text-[#705900]">{places.length} places</span>
          </div>

          <article className="mt-3 flex items-center gap-3 rounded-xl bg-[#f7f7f7] px-3 py-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eaf2ff] text-[#2674e8]">●</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#191919]">Your location</p>
              <p className="truncate text-xs text-[#777]">{locationStatus}</p>
            </div>
            <span className={`size-2.5 shrink-0 rounded-full ${userLocation ? "bg-emerald-500" : "bg-amber-400"}`} />
          </article>

          {activeDestination && (
            <div className="mt-3 rounded-xl border border-[#d7e7ff] bg-[#f4f8ff] px-3 py-2.5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#386da9]">Route shown on map</p>
              <p className="mt-0.5 text-sm font-bold text-[#202020]">Entrance / Exit → {activeDestination.name}</p>
            </div>
          )}

          <div className="mt-3 space-y-2">
            {places.map((place) => {
              const canNavigate = parkName.toLowerCase().includes("bengaluru") && Boolean(WALKING_ROUTES[place.name]);
              const isActive = activeDestination?.name === place.name;
              return (
                <button
                  key={`${place.name}-${place.category}`}
                  type="button"
                  onClick={() => showRoute(place)}
                  disabled={!canNavigate}
                  aria-pressed={isActive}
                  className={`flex min-h-[58px] w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1673e8] disabled:cursor-not-allowed disabled:opacity-55 ${isActive ? "border-[#1673e8] bg-[#f1f7ff]" : "border-[#ededed] bg-white hover:border-[#d6d6d6] hover:bg-[#fafafa]"}`}
                >
                  <span
                    className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e5e5e5] bg-[#fff5c2] bg-cover bg-center text-sm font-extrabold text-[#604d00]"
                    style={{
                      backgroundImage: `url("${place.avatarImage || PARK_LAYOUT_IMAGE}")`,
                      backgroundSize: place.avatarImage ? "cover" : "350% auto",
                      backgroundPosition: place.avatarImage ? "center" : `${place.x}% ${place.y}%`,
                    }}
                    aria-hidden="true"
                  >
                    {!place.avatarImage && <span className="sr-only">{place.name}</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-[#222]">{place.name}</span>
                    <span className="mt-0.5 block text-xs text-[#858585]">{place.category}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${isActive ? "bg-[#1673e8] text-white" : "bg-[#f5c400] text-[#191919]"}`}>
                    {!canNavigate ? "Soon" : isActive ? "On map" : "Route"}
                  </span>
                </button>
              );
            })}
            {places.length === 0 && (
              <p className="rounded-xl bg-[#f7f7f7] p-3 text-sm text-[#777]">Park locations have not been added yet.</p>
            )}
          </div>

          {activeDestination && (
            <button
              type="button"
              onClick={() => setActiveDestination(null)}
              className="mt-3 min-h-11 w-full rounded-xl border border-[#e5e5e5] px-4 py-2 text-sm font-bold text-[#555] hover:bg-[#f7f7f7]"
            >
              Clear route
            </button>
          )}

          {!activeDestination && (
            <p className="mt-3 text-center text-[11px] leading-relaxed text-[#858585]">
              {userLocation && distance !== null ? `${distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`} from Wonderla` : mapReady ? "Choose a place to see its walking route on the map." : mapTileError ? "Map tiles could not load. Check your connection." : "Loading live map…"}
            </p>
          )}
        </div>
      </aside>
    </section>
  );
}
