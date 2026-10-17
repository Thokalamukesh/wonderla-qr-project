"use client";
import React, { useState } from "react";
import { steps, StepValue } from "../_lib/config.data";
import type { MediaItem, EventItem } from "../_lib/types";
import Header from "./_shared/Header";

const tabs = { RIDES: "rides", EVENTS: "events" } as const;
type TabValue = (typeof tabs)[keyof typeof tabs];

interface Props {
  updateStep: (step: StepValue) => void;
  rides: MediaItem[];
  events: EventItem[];
}

const RideEventDetailStep = ({ updateStep, rides, events }: Props) => {
  const [activeTab, setActiveTab] = useState<TabValue>(tabs.RIDES);
  const data: Array<MediaItem | EventItem> = activeTab === tabs.RIDES ? rides : events;

  return (
    <div className="min-h-screen bg-blue">
      <Header title="Rides & Event Details" onBack={() => updateStep(steps.LANDING)} />

      <div className="flex w-full items-stretch">
        {(["rides", "events"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`w-full py-3 ${activeTab === t ? "bg-yellow" : "bg-blue"}`}
          >
            <span className={`font-anton text-xl uppercase tracking-tight ${activeTab === t ? "text-[#0F1C3F]" : "text-white"}`}>
              {t}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 p-4">
        {data.map((item, index) => (
          <div key={`${activeTab}-${item.title}-${index}`} className="flex gap-3 rounded-2xl bg-white p-3 shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
            {item.img ? (
              <img src={item.img} alt={item.title} className="size-[88px] shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="flex size-[88px] shrink-0 items-center justify-center rounded-xl bg-yellow text-3xl">
                {activeTab === "rides" ? "🎢" : "🎉"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              {"time" in item && item.time && (
                <span className="inline-block rounded-full bg-blue px-3 py-0.5 font-mulish text-[11px] font-bold text-white">
                  {(item as EventItem).time}
                </span>
              )}
              <h3 className="mt-1 font-anton text-lg uppercase tracking-tight text-[#0F1C3F]">{item.title}</h3>
              <p className="mt-0.5 font-mulish text-xs text-[#0F1C3F]/75">{item.description}</p>
              {activeTab === "rides" && item.kioskBookingEnabled && item.kioskBookingMessage && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2.5">
                  <span aria-hidden="true" className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs">K</span>
                  <div className="min-w-0">
                    <p className="font-mulish text-[10px] font-extrabold uppercase tracking-wider text-violet-700">Book a time slot at a kiosk</p>
                    <p className="mt-0.5 font-mulish text-xs leading-relaxed text-violet-950">{item.kioskBookingMessage}</p>
                  </div>
                </div>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <span key={t} className="rounded-full bg-[#0F1C3F] px-2.5 py-0.5 font-mulish text-[10px] font-bold text-white">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="font-mulish text-sm text-white/80">Nothing added yet.</p>}
      </div>
    </div>
  );
};

export default RideEventDetailStep;
