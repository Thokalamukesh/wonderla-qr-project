"use client";
import React, { useCallback, useEffect, useState } from "react";
import LandingStep from "../_components/LandingStep";
import ParkMapStep from "../_components/ParkMapStep";
import { PARK_LANDING_HERO, steps, StepValue } from "../_lib/config.data";
import type { ParkConfig } from "../_lib/types";
import RideEventDetailStep from "../_components/RideEventDetailStep";
import DiningMenuStep from "../_components/DiningMenuStep";
import RideWaitTimeStep from "../_components/RideWaitTimeStep";
import MaintenanceLog from "../_components/MaintenanceLog";
import RideGuidlinesStep from "../_components/RideGuidlinesStep";
import SafetyHygieneStep from "../_components/SafetyHygieneStep";
import WavePoolStep from "../_components/WavePoolStep";

interface Props {
  initialConfig: ParkConfig;
}

const QrCodeMain = ({ initialConfig }: Props) => {
  const [step, setStep] = useState<StepValue>(steps.LANDING);
  const [config, setConfig] = useState<ParkConfig>(initialConfig);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(false);

  const updateStep = (next: StepValue) => setStep(next);

  // Re-fetch the latest config for this park (powers the "Refresh"
  // buttons on Live Wait Times & Maintenance Log — truly live now).
  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setRefreshError(false);
      const res = await fetch(`/qr-code/api/parks/${config.slug}?_=${Date.now()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.ok || !json.config) throw new Error("Refresh failed");
      setConfig(json.config);
    } catch {
      setRefreshError(true);
    } finally {
      setRefreshing(false);
    }
  }, [config.slug]);

  // When a guest returns to an already-open QR page, re-check saved park data.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refreshWhenVisible = () => {
      if (document.visibilityState !== "visible") return;
      clearTimeout(timer);
      timer = setTimeout(() => { void refresh(); }, 180);
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refresh]);

  const renderSteps = () => {
    switch (step) {
      case steps.LANDING:
        return (
          <LandingStep
            updateStep={updateStep}
            parkName={config.name}
            logoUrl={config.logoUrl}
            icons={config.landingIcons}
            heroImage={config.heroImageUrl || PARK_LANDING_HERO[config.slug] || config.parkMap?.img}
          />
        );
      case steps.PARK_MAP:
        return <ParkMapStep updateStep={updateStep} data={config.parkMap} parkName={config.name} />;
      case steps.RIDE_EVENT_DETAILS:
        return (
          <RideEventDetailStep
            updateStep={updateStep}
            rides={config.rides}
            events={config.events}
          />
        );
      case steps.DINING_MENU:
        return <DiningMenuStep updateStep={updateStep} data={config.dining} />;
      case steps.LIVE_RIDE_WAIT_TIME:
        return (
          <RideWaitTimeStep
            updateStep={updateStep}
            data={config.liveWaitTimes}
            onRefresh={refresh}
            refreshing={refreshing}
            refreshError={refreshError}
          />
        );
      case steps.MAINTENANCE_LOG:
        return (
          <MaintenanceLog
            updateStep={updateStep}
            data={config.maintenanceLog}
            onRefresh={refresh}
            refreshing={refreshing}
            refreshError={refreshError}
          />
        );
      case steps.RIDE_GUIDELINES:
        return <RideGuidlinesStep updateStep={updateStep} data={config.rideGuidelines} />;
      case steps.SAFETY_AND_HYGIENE_INFO:
        return <SafetyHygieneStep updateStep={updateStep} data={config.safetyHygiene} />;
      case steps.WAVE_POOL_RAIN_DANCE:
        return <WavePoolStep updateStep={updateStep} data={config.waveRainDance} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-[#0a1026]">
      <main className="w-full max-w-[480px] bg-blue">{renderSteps()}</main>
    </div>
  );
};

export default QrCodeMain;
