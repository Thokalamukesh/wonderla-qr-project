"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

const WONDERLA_BENGALURU: [number, number] = [12.8343, 77.401];
type UserLocation = { latitude: number; longitude: number };

const destinationIcon = L.divIcon({
  className: "live-map-marker-wrap",
  html: '<span class="live-map-destination"><span>W</span></span>',
  iconSize: [42, 50],
  iconAnchor: [21, 46],
});

const userIcon = L.divIcon({
  className: "live-map-marker-wrap",
  html: '<span class="live-map-user"><span></span></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function FitLocations({ userLocation }: { userLocation: UserLocation | null }) {
  const map = useMap();
  const hasFittedLocations = useRef(false);

  useEffect(() => {
    if (userLocation && !hasFittedLocations.current) {
      hasFittedLocations.current = true;
      map.fitBounds([WONDERLA_BENGALURU, [userLocation.latitude, userLocation.longitude]], {
        padding: [64, 64],
        maxZoom: 15,
        animate: true,
      });
    }
  }, [map, userLocation]);

  return null;
}

export default function InteractiveParkMap({ parkName }: { parkName: string }) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState("Finding your live location…");
  const [locate, setLocate] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Live location is not available in this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationStatus("Your live location");
      },
      (error) => {
        setLocationStatus(error.code === error.PERMISSION_DENIED
          ? "Allow location access to show your live position."
          : "Could not get your location. Check location services and try again.");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const registerMap = useCallback((map: L.Map) => {
    setLocate(() => () => {
      if (userLocation) map.flyTo([userLocation.latitude, userLocation.longitude], 16);
      else map.flyTo(WONDERLA_BENGALURU, 14);
    });
  }, [userLocation]);

  return (
    <section className="relative h-[calc(100dvh-112px)] min-h-[420px] overflow-hidden rounded-2xl bg-slate-100 shadow-lg">
      <MapContainer
        center={WONDERLA_BENGALURU}
        zoom={14}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitLocations userLocation={userLocation} />
        <Marker position={WONDERLA_BENGALURU} icon={destinationIcon} />
        {userLocation && <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon} />}
        <MapReady onReady={registerMap} />
      </MapContainer>

      <div className="pointer-events-none absolute left-3 right-3 top-3 z-[500] flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
          <p className="text-sm font-extrabold text-slate-900">Wonderla Bengaluru</p>
          <p className="mt-0.5 text-xs text-slate-500">12.8343° N, 77.4010° E</p>
        </div>
        <div className="max-w-[48vw] rounded-full bg-white/95 px-3 py-2 text-right text-xs font-semibold text-slate-700 shadow-lg backdrop-blur-sm">
          <span className={`mr-2 inline-block size-2 rounded-full align-middle ${userLocation ? "bg-emerald-500" : "bg-amber-500"}`} />
          {locationStatus}
        </div>
      </div>

      {locate && (
        <button
          type="button"
          onClick={locate}
          className="absolute bottom-8 right-4 z-[500] flex size-12 items-center justify-center rounded-full bg-white text-xl text-slate-800 shadow-lg hover:bg-slate-50"
          aria-label="Center map on my location"
          title="Center map on my location"
        >
          ◎
        </button>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg">
        <span className="mr-2 inline-block size-2.5 rounded-full bg-blue-500" />You
        <span className="mx-2 text-slate-300">•</span>
        <span className="mr-1 text-rose-600">●</span>{parkName}
      </div>
    </section>
  );
}

function MapReady({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => onReady(map), [map, onReady]);
  return null;
}
