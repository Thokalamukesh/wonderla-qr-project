"use client";
import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, ImageOverlay, useMap } from "react-leaflet";
import L from "leaflet";
import type { ParkMapPlace } from "../_lib/types";

const MAP_WIDTH = 1800;
const MAP_HEIGHT = 1381;
type IndexedPlace = { place: ParkMapPlace; index: number };

const coords = (place: ParkMapPlace): [number, number] => [
  MAP_HEIGHT * (1 - place.y / 100),
  MAP_WIDTH * place.x / 100,
];

const categoryColor = (category: string) => {
  const value = category.toLowerCase();
  if (value.includes("food") || value.includes("dining") || value.includes("restaurant")) return "#d97706";
  if (value.includes("water") || value.includes("pool")) return "#0284c7";
  if (value.includes("facility") || value.includes("restroom") || value.includes("first aid")) return "#059669";
  return "#e11d48";
};

const placeIcon = (selected: boolean, number: number, color: string) => L.divIcon({
  className: "wonderla-map-pin-wrap",
  html: `<span style="background:${selected ? "#4f46e5" : color}; transform: rotate(-45deg)" class="wonderla-map-pin"><span style="transform: rotate(45deg); display: block">${number}</span></span>`,
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const validPlaces = useMemo<IndexedPlace[]>(
    () => places
      .map((place, index) => ({ place, index }))
      .filter(({ place }) => Number.isFinite(place.x) && Number.isFinite(place.y) && place.name.trim()),
    [places],
  );
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(validPlaces.map(({ place }) => place.category.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b))],
    [validPlaces],
  );
  const filteredPlaces = useMemo(() => {
    const query = search.trim().toLowerCase();
    return validPlaces.filter(({ place }) =>
      (activeCategory === "All" || place.category === activeCategory)
      && (!query || `${place.name} ${place.category}`.toLowerCase().includes(query)),
    );
  }, [activeCategory, search, validPlaces]);
  const selectedPlace = selectedIndex === null ? null : places[selectedIndex] || null;

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
    <section className="grid gap-3 lg:h-[calc(100dvh-170px)] lg:min-h-[560px] lg:grid-cols-[minmax(230px,280px)_minmax(0,1fr)_minmax(220px,280px)]">
      <aside className="order-2 flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:order-1">
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-anton text-xl uppercase tracking-tight text-[#0F1C3F]">Explore {parkName}</h2>
              <p className="mt-1 text-xs text-slate-500">Find rides, food and facilities.</p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{validPlaces.length}</span>
          </div>
          <label className="mt-3 block">
            <span className="sr-only">Search park locations</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search locations"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white"
            />
          </label>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Filter by category">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${activeCategory === category ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[38vh] min-h-32 divide-y divide-slate-100 overflow-y-auto overscroll-contain lg:max-h-none lg:flex-1">
          {filteredPlaces.map(({ place, index }) => {
            const selected = index === selectedIndex;
            return (
              <button
                key={`${place.name}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-pressed={selected}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${selected ? "bg-indigo-50" : "hover:bg-slate-50"}`}
              >
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}>{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-800">{place.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">{place.category || "Park location"}</span>
                </span>
                <span aria-hidden="true" className="text-lg text-slate-400">›</span>
              </button>
            );
          })}
          {filteredPlaces.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-slate-500">No locations match your search.</p>
          )}
        </div>
      </aside>

      <div className="relative order-1 h-[48vh] min-h-[280px] max-h-[560px] overflow-hidden rounded-2xl bg-slate-100 shadow-sm lg:order-2 lg:h-full lg:max-h-none">
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
          {filteredPlaces.map(({ place, index }) => (
            <Marker
              key={`${place.name}-${index}`}
              position={coords(place)}
              icon={placeIcon(index === selectedIndex, index + 1, categoryColor(place.category))}
              eventHandlers={{ click: () => setSelectedIndex(index) }}
            />
          ))}
        </MapContainer>
        <div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-slate-700 shadow">
          {selectedPlace ? selectedPlace.name : `${filteredPlaces.length} locations shown`}
        </div>
      </div>

      <aside className="order-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:overflow-y-auto">
        {selectedPlace ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Selected location</p>
            <div className="mt-3 flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl" aria-hidden="true">📍</div>
            <h2 className="mt-3 break-words font-anton text-2xl uppercase leading-tight tracking-tight text-[#0F1C3F]">{selectedPlace.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{selectedPlace.category || "Park location"}</p>
            <a
              href={googleMapsUrl(selectedPlace)}
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#1a73e8] px-4 py-3 text-sm font-bold text-white hover:bg-[#1558b0]"
            >
              Open in Google Maps <span aria-hidden="true">↗</span>
            </a>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">Google Maps opens a search for this location at {parkName}.</p>
            <button type="button" onClick={() => setSelectedIndex(null)} className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Clear selection</button>
          </>
        ) : (
          <div className="flex h-full min-h-24 flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Discover the park</p>
            <h2 className="mt-2 font-anton text-2xl uppercase tracking-tight text-[#0F1C3F]">Choose a location</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">Select a place from the list or tap its pin on the map to see details and open it in Google Maps.</p>
          </div>
        )}
      </aside>
    </section>
  );
}
