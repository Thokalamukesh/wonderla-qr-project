import React from "react";
import { steps, StepValue } from "../_lib/config.data";
import type { SafetyItem } from "../_lib/types";
import Header from "./_shared/Header";

interface Props {
  updateStep: (step: StepValue) => void;
  data: SafetyItem[];
}

const SafetyHygieneStep = ({ updateStep, data }: Props) => (
  <div className="min-h-screen bg-blue">
    <Header title="Safety & Hygiene" onBack={() => updateStep(steps.LANDING)} />
    <div className="flex flex-col gap-3 px-4 py-5">
      {(data ?? []).map((item, i) => (
        <div key={`${item.title}-${i}`} className="flex gap-3 rounded-2xl bg-white p-3 shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
          {item.img ? (
            <img src={item.img} alt={item.title} className="size-[90px] shrink-0 rounded-xl object-cover" />
          ) : (
            <div className="flex size-[90px] shrink-0 items-center justify-center rounded-xl bg-yellow text-4xl">🛡️</div>
          )}
          <div className="min-w-0">
            <h3 className="font-anton text-lg uppercase tracking-tight text-[#0F1C3F]">{item.title}</h3>
            <p className="mt-1 font-mulish text-xs text-[#0F1C3F]/75">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SafetyHygieneStep;
