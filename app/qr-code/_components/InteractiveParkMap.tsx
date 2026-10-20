"use client";
import React, { useEffect } from "react";
import { MapContainer, Marker, ImageOverlay, useMap } from "react-leaflet";
import L from "leaflet";
import type { ParkMapPlace } from "../_lib/types";

const MAP_WIDTH = 1800;
const MAP_HEIGHT = 1381;
const coords = (place: ParkMapPlace): [number, number] => [
  MAP_HEIGHT * (1 - place.y / 100),
  MAP_WIDTH * place.x / 100,
];

const placeIcon = (selected: boolean, number: number) => L.divIcon({
  className: "wonderla-map-pin-wrap",
  html: `<span style="background:${selected ? "#4f46e5" : "#0f766e"}; transform: rotate(-45deg)" class="wonderla-map-pin"><span style="transform: rotate(45deg); display: block">${number}</span></span>`,
  iconSize: [34, 42],
  iconAnchor: [17, 38],
});

function FocusPlace({ place }: { place: ParkMapPlace | null }) {
  const map = useMap();
  useEffect(() => {
    if (place) map.panTo(coords(place), { animate: true, duration: 0.35 });
  }, [map, place]);
  return null;
}

export default function InteractiveParkMap({ image, places, parkName }: { image: string; places: ParkMapPlace[]; parkName: string }) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const validPlaces = places.filter((place) => Number.isFinite(place.x) && Number.isFinite(place.y) && place.name.trim());
  const selectedPlace = selectedIndex === null ? null : validPlaces[selectedIndex] || null;

  const googleMapsUrl = (place: ParkMapPlace) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${parkName}`)}`;

  if (!validPlaces.length) {
    return (
      <section className="overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="font-bold text-slate-800">{parkName} park map</h2>
          <p className="text-xs text-slate-500">Explore the park layout and facility guide.</p>
        </div>
        <div className="flex max-h-[75vh] min-h-[340px] items-center justify-center overflow-auto bg-slate-100 p-2">
          <img src={image} alt={`${parkName} park map and facilities`} className="max-h-[72vh] max-w-full object-contain" />
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-lg">
      <div className="relative h-[48vh] min-h-[280px] max-h-[560px] bg-slate-100">
        <MapContainer
          crs={L.CRS.Simple}
          bounds={[[0, 0], [MAP_HEIGHT, MAP_WIDTH]]}
          maxBounds={[[0, 0], [MAP_HEIGHT, MAP_WIDTH]]}
          maxBoundsViscosity={0.85}
          minZoom={-2}
          maxZoom={2}
          scrollWheelZoom
          className="h-full w-full"
        >
          <ImageOverlay url={image} bounds={[[0, 0], [MAP_HEIGHT, MAP_WIDTH]]} />
          <FocusPlace place={selectedPlace} />
          {validPlaces.map((place, index) => (
            <Marker
              key={`${place.name}-${index}`}
              position={coords(place)}
              icon={placeIcon(index === selectedIndex, index + 1)}
              eventHandlers={{ click: () => setSelectedIndex(index) }}
            />
          ))}
        </MapContainer>
        <div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-slate-700 shadow">
          {selectedPlace ? `Selected: ${selectedPlace.name}` : "Tap a pin or choose a place below"}
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="flex items-end justify-between gap-3 px-4 pb-3 pt-4">
          <div>
            <h2 className="font-anton text-xl uppercase tracking-tight text-[#0F1C3F]">Places in the park</h2>
            <p className="mt-0.5 text-xs text-slate-500">Choose a place to highlight it on the map.</p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{validPlaces.length} places</span>
        </div>
        <ul className="max-h-[42vh] divide-y divide-slate-100 overflow-y-auto overscroll-contain">
          {validPlaces.map((place, index) => {
            const selected = index === selectedIndex;
            return (
              <li key={`${place.name}-${index}`}>
                <div className={`flex items-center gap-3 px-4 py-3 ${selected ? "bg-indigo-50" : "bg-white"}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    aria-pressed={selected}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}>{index + 1}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-slate-800">{place.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">{place.category}</span>
                    </span>
                  </button>
                  <a
                    href={googleMapsUrl(place)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${place.name} in Google Maps`}
                    className="shrink-0 rounded-full bg-[#1a73e8] px-3 py-2 text-xs font-bold text-white hover:bg-[#1558b0]"
                  >
                    Google Maps ↗
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
