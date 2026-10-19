"use client";
import React, { useState } from "react";
import { steps, StepValue } from "../_lib/config.data";
import type { MediaItem, EventItem } from "../_lib/types";
import Header from "./_shared/Header";
import KioskBookingCallout from "./_shared/KioskBookingCallout";

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
          <button key={t} type="button" onClick={() => setActiveTab(t)} aria-pressed={activeTab === t} className={`w-full py-3 transition-colors ${activeTab === t ? "bg-yellow" : "bg-blue"}`}>
            <span className={`font-anton text-xl uppercase tracking-tight ${activeTab === t ? "text-[#0F1C3F]" : "text-white"}`}>{t}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 p-4">
        {data.map((item, index) => (
          <article key={`${activeTab}-${item.title}-${index}`} className="rounded-2xl bg-white p-3 shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
            <div className="flex items-start gap-3">
              {item.img ? (
                <img src={item.img} alt={item.title} className="size-[88px] shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="flex size-[88px] shrink-0 items-center justify-center rounded-xl bg-yellow text-3xl">{activeTab === "rides" ? "ðŸŽ¢" : "ðŸŽ‰"}</div>
              )}
              <div className="min-w-0 flex-1">
                {"time" in item && item.time && <span className="inline-block rounded-full bg-blue px-3 py-0.5 font-mulish text-[11px] font-bold text-white">{(item as EventItem).time}</span>}
                <h3 className="mt-1 font-anton text-lg uppercase tracking-tight text-[#0F1C3F]">{item.title}</h3>
                <p className="mt-0.5 font-mulish text-xs text-[#0F1C3F]/75">{item.description}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => <span key={tag} className="rounded-full bg-[#0F1C3F] px-2.5 py-0.5 font-mulish text-[10px] font-bold text-white">{tag}</span>)}
                  </div>
                )}
              </div>
            </div>
            {activeTab === "rides" && item.kioskBookingEnabled && <KioskBookingCallout />}
          </article>
        ))}
        {data.length === 0 && <p className="font-mulish text-sm text-white/80">Nothing added yet.</p>}
      </div>
    </div>
  );
};

export default RideEventDetailStep;
