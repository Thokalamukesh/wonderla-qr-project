import React from "react";
import { steps, StepValue } from "../_lib/config.data";
import type { WaveRainItem } from "../_lib/types";
import Header from "./_shared/Header";

interface Props {
  updateStep: (step: StepValue) => void;
  data: WaveRainItem[];
}

const WavePoolStep = ({ updateStep, data }: Props) => (
  <div className="min-h-screen bg-gradient-to-b from-[#f3f7ff] to-[#e5edff]">
    <Header title="Wave Pool & Rain Dance" onBack={() => updateStep(steps.LANDING)} />
    <div className="flex flex-col gap-4 px-4 py-5">
      {(data ?? []).map((item, i) => (
        <div data-scroll-reveal key={`${item.title}-${i}`} className="overflow-hidden rounded-2xl border border-white/90 bg-gradient-to-br from-white/90 to-[#eaf1ff]/85 shadow-[0_8px_24px_rgba(24,61,154,0.10)] backdrop-blur-xl">
          {item.img ? (
            <img src={item.img} alt={item.title} className="h-[150px] w-full object-cover" />
          ) : (
            <div className="flex h-[150px] w-full items-center justify-center bg-yellow text-5xl">🌊</div>
          )}
          <div className="p-4">
            <h3 className="font-anton text-xl uppercase tracking-tight text-[#0F1C3F]">{item.title}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.timeSlot.map((ele) => (
                <span key={ele} className="rounded-full bg-blue px-3 py-1 font-mulish text-[11px] font-bold text-white">
                  {ele}
                </span>
              ))}
            </div>
            <p className="mt-2 font-mulish text-xs font-semibold text-[#0F1C3F]/70">
              {item.rideDuration} mins each
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default WavePoolStep;
