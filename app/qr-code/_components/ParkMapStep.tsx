import React from "react";
import dynamic from "next/dynamic";
import { steps, StepValue } from "../_lib/config.data";
import Header from "./_shared/Header";

const InteractiveParkMap = dynamic(() => import("./InteractiveParkMap"), { ssr: false, loading: () => <div className="flex h-[55vh] min-h-[340px] items-center justify-center rounded-2xl bg-white text-sm text-slate-500">Loading park map…</div> });

interface Props {
  updateStep: (step: StepValue) => void;
}

const ParkMapStep = ({ updateStep }: Props) => (
  <div className="min-h-screen bg-blue">
    <Header title="Park Map" onBack={() => updateStep(steps.LANDING)} />
    <div className="px-4 py-5">
      <InteractiveParkMap parkName="Wonderla Bengaluru" />
    </div>
  </div>
);

export default ParkMapStep;
