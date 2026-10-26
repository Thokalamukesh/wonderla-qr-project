import React from "react";
import dynamic from "next/dynamic";
import { steps, StepValue } from "../_lib/config.data";
import Header from "./_shared/Header";

const InteractiveParkMap = dynamic(() => import("./InteractiveParkMap"), { ssr: false, loading: () => <div className="flex h-full min-h-0 w-full items-center justify-center rounded-2xl bg-white text-sm text-slate-500">Loading park map…</div> });

interface Props {
  updateStep: (step: StepValue) => void;
}

const ParkMapStep = ({ updateStep }: Props) => (
  <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-blue">
    <Header title="Park Map" onBack={() => updateStep(steps.LANDING)} />
    <div className="flex min-h-0 flex-1 px-4 pb-4 pt-4">
      <InteractiveParkMap parkName="Wonderla Bengaluru" />
    </div>
  </div>
);

export default ParkMapStep;
