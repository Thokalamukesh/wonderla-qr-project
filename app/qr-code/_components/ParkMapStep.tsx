import React from "react";
import dynamic from "next/dynamic";
import { steps, StepValue } from "../_lib/config.data";
import type { ParkMapConfig } from "../_lib/types";
import Header from "./_shared/Header";

const InteractiveParkMap = dynamic(() => import("./InteractiveParkMap"), { ssr: false, loading: () => <div className="flex h-[55vh] min-h-[340px] items-center justify-center rounded-2xl bg-white text-sm text-slate-500">Loading park map…</div> });

interface Props {
  updateStep: (step: StepValue) => void;
  data: ParkMapConfig;
  parkName: string;
}

const ParkMapStep = ({ updateStep, data, parkName }: Props) => (
  <div className="min-h-screen bg-blue">
    <Header title="Park Map" onBack={() => updateStep(steps.LANDING)} />
    <div className="px-4 py-5">
      {data?.img && data.places?.length ? (
        <InteractiveParkMap image={data.img} places={data.places} parkName={parkName} />
      ) : data?.img ? (
        <img src={data.img} alt="Park map" className="w-full rounded-2xl object-contain" />
      ) : (
        <div className="flex h-[230px] w-full items-center justify-center rounded-2xl bg-yellow">
          <span className="text-6xl">🗺️</span>
        </div>
      )}
      {data?.description && (
        <p className="mt-3 font-mulish text-sm text-white/85">{data.description}</p>
      )}
      {Array.isArray(data?.zones) && data.zones.length > 0 && !data?.places?.length && (
        <div className="mt-4 flex flex-col gap-3">
          {data.zones.map((zone, i) => (
            <div key={`${zone.name}-${i}`} className="rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
              <h3 className="font-anton text-lg uppercase tracking-tight text-[#0F1C3F]">{zone.name}</h3>
              <p className="mt-1 font-mulish text-sm text-[#0F1C3F]/70">{zone.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default ParkMapStep;
