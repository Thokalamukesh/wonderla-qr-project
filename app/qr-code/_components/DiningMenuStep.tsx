"use client";
import React, { useState } from "react";
import { steps, StepValue } from "../_lib/config.data";
import type { DiningOutlet } from "../_lib/types";
import Header from "./_shared/Header";
import { VegMark } from "./_shared/VegMark";

interface Props {
  updateStep: (step: StepValue) => void;
  data: DiningOutlet[];
}

type VegFilter = "all" | "veg" | "nonveg";

const OutletDetail = ({ outlet, onBack }: { outlet: DiningOutlet; onBack: () => void }) => {
  const [filter, setFilter] = useState<VegFilter>("all");
  const items = outlet.items.filter((it) =>
    filter === "all" ? true : filter === "veg" ? it.veg : !it.veg
  );

  return (
    <div className="min-h-screen bg-blue">
      <Header title="Dining & Menu" onBack={onBack} />

      {/* Hero image */}
      <div className="px-4 pt-4">
        {outlet.img ? (
          <img src={outlet.img} alt={outlet.name} className="h-[230px] w-full rounded-2xl object-cover" />
        ) : (
          <div className="flex h-[230px] w-full items-center justify-center rounded-2xl bg-yellow">
            <span className="text-6xl">🍴</span>
          </div>
        )}
      </div>

      <div className="px-5 pt-4">
        <h1 className="font-anton text-[clamp(26px,8vw,36px)] uppercase leading-[0.95] tracking-tight text-white">
          {outlet.name}
        </h1>
        {outlet.directionsUrl ? (
          <a
            href={outlet.directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 font-mulish text-sm font-extrabold uppercase text-yellow"
          >
            Get Direction <span>›</span>
          </a>
        ) : null}
        {outlet.description && (
          <p className="mt-2 font-mulish text-sm text-white/85">{outlet.description}</p>
        )}
        {outlet.tags && outlet.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {outlet.tags.map((t) => (
              <span key={t} className="rounded-full bg-white/15 px-3 py-1 font-mulish text-[11px] font-bold text-white">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Explore menu (yellow section) */}
      <div className="mt-5 rounded-t-[28px] bg-yellow px-5 pb-10 pt-7">
        <h2 className="text-center font-anton text-[clamp(30px,9vw,42px)] uppercase leading-none tracking-tight text-[#0F1C3F]">
          Explore Menu
        </h2>
        <p className="mt-1 text-center font-mulish text-sm text-[#0F1C3F]/80">
          Awaken your inner foodie by diving into our irresistible menu options!
        </p>

        {/* Veg / non-veg filter */}
        <div className="mt-5 flex items-center justify-center gap-3">
          {(["all", "veg", "nonveg"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 font-mulish text-xs font-bold capitalize transition ${
                filter === f ? "bg-[#0F1C3F] text-white" : "bg-white text-[#0F1C3F]"
              }`}
            >
              {f === "nonveg" ? "Non-Veg" : f}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {items.map((it, i) => (
            <div
              key={`${it.name}-${i}`}
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-b from-white to-slate-50 p-3 shadow-sm"
            >
              {it.img ? (
                <img src={it.img} alt={it.name} className="size-[64px] shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="flex size-[64px] shrink-0 items-center justify-center rounded-xl bg-white/70 text-2xl">
                  🍽️
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-anton text-lg uppercase tracking-tight text-[#0F1C3F]">
                  {it.name}
                </h3>
                <div className="mt-1">
                  <VegMark veg={it.veg} withLabel />
                </div>
              </div>
              <span className="shrink-0 font-mulish text-sm font-extrabold text-[#0F1C3F]">{it.price}</span>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-center font-mulish text-sm text-[#0F1C3F]/70">No items for this filter.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const DiningMenuStep = ({ updateStep, data }: Props) => {
  const [selected, setSelected] = useState<number | null>(null);

  if (selected !== null && data[selected]) {
    return <OutletDetail outlet={data[selected]} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="min-h-screen bg-blue">
      <Header title="Dining & Menu" onBack={() => updateStep(steps.LANDING)} />

      <div className="flex flex-col gap-4 px-4 py-5">
        {(data ?? []).map((outlet, i) => (
          <button
            key={`${outlet.name}-${i}`}
            type="button"
            onClick={() => setSelected(i)}
            className="flex gap-3 rounded-2xl bg-white p-3 text-left shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition active:scale-[0.99]"
          >
            {outlet.img ? (
              <img src={outlet.img} alt={outlet.name} className="size-[96px] shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="flex size-[96px] shrink-0 items-center justify-center rounded-xl bg-yellow text-4xl">
                🍴
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-anton text-lg uppercase leading-tight tracking-tight text-[#0F1C3F]">
                {outlet.name}
              </h3>
              {outlet.description && (
                <p className="mt-1 line-clamp-2 font-mulish text-xs text-[#0F1C3F]/70">
                  {outlet.description}
                </p>
              )}
              {outlet.tags && outlet.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {outlet.tags.map((t) => (
                    <span key={t} className="rounded-full bg-[#0F1C3F] px-2.5 py-0.5 font-mulish text-[10px] font-bold text-white">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <span className="mt-2 inline-flex items-center gap-1 font-mulish text-xs font-extrabold uppercase text-blue">
                Explore More <span>›</span>
              </span>
            </div>
          </button>
        ))}
        {(!data || data.length === 0) && (
          <p className="font-mulish text-sm text-white/80">No dining outlets added yet.</p>
        )}
      </div>
    </div>
  );
};

export default DiningMenuStep;
