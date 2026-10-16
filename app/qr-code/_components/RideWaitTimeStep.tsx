"use client";
import React from "react";
import { steps, StepValue } from "../_lib/config.data";
import type { WaitTimeItem } from "../_lib/types";
import Header from "./_shared/Header";

interface Props {
  updateStep: (step: StepValue) => void;
  data: WaitTimeItem[];
  onRefresh?: () => void;
  refreshing?: boolean;
  refreshError?: boolean;
}

const RefreshButton = ({ onRefresh, refreshing }: { onRefresh?: () => void; refreshing?: boolean }) => (
  <button type="button" onClick={onRefresh} disabled={refreshing} className="flex flex-col items-center gap-1 disabled:opacity-60">
    <span className={`flex size-9 items-center justify-center rounded-full bg-yellow text-lg ${refreshing ? "animate-spin" : ""}`}>↻</span>
    <span className="font-mulish text-[11px] font-bold text-white">{refreshing ? "..." : "Refresh"}</span>
  </button>
);

const RideWaitTimeStep = ({ updateStep, data, onRefresh, refreshing, refreshError }: Props) => (
  <div className="min-h-screen bg-blue">
    <Header
      title="Live Ride Wait Time"
      onBack={() => updateStep(steps.LANDING)}
      right={<RefreshButton onRefresh={onRefresh} refreshing={refreshing} />}
    />
    {refreshError && <p role="status" className="px-4 pt-3 text-center font-mulish text-xs text-white">Could not refresh. Check your connection and try again.</p>}
    <div className="flex flex-col gap-3 px-4 py-5">
      {(data ?? []).map((item, i) => (
        <div key={`${item.title}-${i}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
          {item.img ? (
            <img src={item.img} alt={item.title} className="size-[84px] shrink-0 rounded-xl object-cover" />
          ) : (
            <div className="flex size-[84px] shrink-0 items-center justify-center rounded-xl bg-yellow text-3xl">🎢</div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-anton text-lg uppercase tracking-tight text-[#0F1C3F]">{item.title}</h3>
            <p className="font-mulish text-xs text-[#0F1C3F]/70">{item.description}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 font-mulish text-xs font-bold text-white ${
              item.time >= 20 ? "bg-[#E14F1B]" : item.time >= 10 ? "bg-blue" : "bg-[#0B8043]"
            }`}
          >
            {item.time} min
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default RideWaitTimeStep;
