import React from "react";
import { DEFAULT_LANDING_ICONS, steps, StepValue } from "../_lib/config.data";
import type { LandingIcons } from "../_lib/types";
import Wordmark from "./_shared/Wordmark";

interface Props {
  updateStep: (step: StepValue) => void;
  parkName?: string;
  logoUrl?: string;
  icons?: LandingIcons;
  heroImage?: string;
}

interface Tile { icon: keyof LandingIcons; label: string; subtitle: string; step: StepValue; color: string; tint: string; }

const LandingStep = ({ updateStep, parkName, logoUrl, heroImage, icons }: Props) => {
  const logo = logoUrl || "/wonderla/logo.png";
  const tileIcons = { ...DEFAULT_LANDING_ICONS, ...(icons || {}) };

  const tiles: Tile[] = [
    { icon: "parkMap", label: "Park Map", subtitle: "Find rides & facilities", step: steps.PARK_MAP, color: "#2A41B1", tint: "#E7ECFF" },
    { icon: "ridesEvents", label: "Rides & Events", subtitle: "Explore rides and shows", step: steps.RIDE_EVENT_DETAILS, color: "#EA580C", tint: "#FFEEE2" },
    { icon: "dining", label: "Dining & Menu", subtitle: "Food, menus & prices", step: steps.DINING_MENU, color: "#DB2777", tint: "#FFE7F1" },
    { icon: "waitTimes", label: "Live Wait Times", subtitle: "Current ride queues", step: steps.LIVE_RIDE_WAIT_TIME, color: "#15803D", tint: "#E4F7EA" },
    { icon: "guidelines", label: "Ride Guidelines", subtitle: "Height limits & rules", step: steps.RIDE_GUIDELINES, color: "#4F46E5", tint: "#ECEBFF" },
    { icon: "wavePool", label: "Wave Pool & Rain Dance", subtitle: "Sessions & timings", step: steps.WAVE_POOL_RAIN_DANCE, color: "#0E7490", tint: "#E0F7FB" },
    { icon: "safety", label: "Safety & Hygiene", subtitle: "Guest safety information", step: steps.SAFETY_AND_HYGIENE_INFO, color: "#047857", tint: "#E2F6EF" },
    { icon: "maintenance", label: "Maintenance Log", subtitle: "Ride service records", step: steps.MAINTENANCE_LOG, color: "#475569", tint: "#EEF1F5" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f8ef] to-[#e9f3e8]">
      {/* Logo bar */}
      <header className="flex justify-center border-b border-[#dcebdd] bg-[#f8faef] px-4 py-2.5 shadow-sm">
        <Wordmark logoUrl={logo} />
      </header>

      <div className="mx-auto max-w-[560px] px-4 pb-8 pt-4 sm:px-5 sm:pt-5">
        {/* Hero banner — single focal image, clean */}
        <div className="relative h-[210px] overflow-hidden rounded-[26px] shadow-[0_18px_36px_rgba(15,31,100,0.2)] sm:h-[250px] sm:rounded-[30px]">
          {heroImage ? (
            <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#4ba975] via-[#176b4a] to-[#0e4c38]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1230]/95 via-[#0B1230]/25 to-[#0B1230]/5" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <span className="inline-block rounded-full border border-white/20 bg-white/15 px-3 py-1 font-mulish text-[10px] font-extrabold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              Scan • Explore • Enjoy
            </span>
            <h1 className="mt-2 font-anton text-[clamp(34px,9vw,48px)] uppercase leading-[0.92] tracking-tight text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">
              Welcome to<br />Wonderla
            </h1>
            {parkName && <p className="mt-1 font-mulish text-sm font-bold text-yellow">📍 {parkName}</p>}
          </div>
        </div>

        {/* Section heading */}
        <h2 className="mb-3 mt-6 font-anton text-xl uppercase tracking-tight text-[#17234a] sm:mt-7">
          Explore the Park
        </h2>

        {/* Clean card grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
          {tiles.map((t) => (
            <button
              key={t.label}
              type="button"
              aria-label={`${t.label}: ${t.subtitle}`}
              onClick={() => updateStep(t.step)}
              data-scroll-reveal
              className="group flex min-h-[100px] items-start gap-2.5 rounded-2xl border border-[#dcebdd] bg-gradient-to-br from-[#fbfcf3] to-[#edf6ec] p-3 text-left shadow-[0_8px_22px_rgba(19,83,57,0.08)] transition hover:-translate-y-0.5 hover:border-[#b8d9c1] hover:shadow-[0_14px_28px_rgba(19,83,57,0.15)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow sm:min-h-[108px] sm:gap-3 sm:p-3.5"
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-xl text-[22px] shadow-sm transition-transform group-hover:scale-105 sm:size-11"
                style={{ backgroundColor: t.tint, color: t.color }}
              >
                <span aria-hidden="true" className="leading-none">{tileIcons[t.icon]}</span>
              </span>
              <span className="min-w-0 flex-1 pt-0.5">
                <span className="block font-anton text-[13px] uppercase leading-tight tracking-tight text-[#0F1C3F] sm:text-[15px]">
                  {t.label}
                </span>
                <span className="mt-1 block font-mulish text-[12px] leading-snug text-[#0F1C3F]/75 sm:text-[12px]">
                  {t.subtitle}
                </span>
              </span>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center font-mulish text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
          Have a Wonder-ful day!
        </p>
      </div>
    </div>
  );
};

export default LandingStep;
