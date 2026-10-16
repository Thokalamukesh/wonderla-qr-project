import React from "react";
import { steps, StepValue } from "../_lib/config.data";
import type { GuidelineItem } from "../_lib/types";
import Header from "./_shared/Header";

interface Props {
  updateStep: (step: StepValue) => void;
  data: GuidelineItem[];
}

const RideGuidlinesStep = ({ updateStep, data }: Props) => (
  <div className="min-h-screen bg-blue">
    <Header title="Ride Guidelines" onBack={() => updateStep(steps.LANDING)} />
    <div className="flex flex-col gap-3 px-4 py-5">
      {(data ?? []).map((item, i) => (
        <div key={`${item.title}-${i}`} className="rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-anton text-lg uppercase tracking-tight text-[#0F1C3F]">{item.title}</h3>
            {item.minHeight && (
              <span className="shrink-0 rounded-full bg-blue px-3 py-1 font-mulish text-[11px] font-bold text-white">
                Min {item.minHeight}
              </span>
            )}
          </div>
          <p className="mt-2 font-mulish text-sm text-[#0F1C3F]/75">{item.description}</p>
        </div>
      ))}
      {(!data || data.length === 0) && (
        <p className="font-mulish text-sm text-white/80">No guidelines added yet.</p>
      )}
    </div>
  </div>
);

export default RideGuidlinesStep;
