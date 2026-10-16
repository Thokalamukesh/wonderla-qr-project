import React from "react";
import { steps, StepValue } from "../_lib/config.data";
import type { LandingIcons } from "../_lib/types";
import Wordmark from "./_shared/Wordmark";

interface Props {
  updateStep: (step: StepValue) => void;
  parkName?: string;
  logoUrl?: string;
  icons?: LandingIcons;
  heroImage?: string;
}

const Icon = ({ name }: { name: string }) => {
  const p = "size-6";
  switch (name) {
    case "map": return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>;
    case "ride": return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p}><path d="M4 19V5M20 19V5"/><path d="M4 8c6 4 10 4 16 0"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="18" r="1.6"/></svg>;
    case "dining": return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p}><path d="M5 3v8M8 3v8M6.5 11v10M6.5 3v2"/><path d="M17 3c-1.7 0-3 2-3 5s1.3 4 3 4v9"/></svg>;
    case "clock": return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "ruler": return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p}><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 7v4M11 7v6M15 7v4M19 7v6"/></svg>;
    case "waves": return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p}><path d="M2 8c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 14c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2"/></svg>;
    case "shield": return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p}><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>;
    default: return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p}><path d="M14.5 6.5a3.5 3.5 0 0 0 4.6 4.6L21 13l-8 8-2-2M14.5 6.5 10 11M14.5 6.5 12 4a4 4 0 0 0-5.2 5.2L4 12l3 3"/></svg>;
  }
};

interface Tile { icon: string; label: string; subtitle: string; step: StepValue; color: string; tint: string; }

const LandingStep = ({ updateStep, parkName, logoUrl, heroImage }: Props) => {
  const logo = logoUrl || "/wonderla/logo.png";

  const tiles: Tile[] = [
    { icon: "map", label: "Park Map", subtitle: "Find your way", step: steps.PARK_MAP, color: "#2A41B1", tint: "#E7ECFF" },
    { icon: "ride", label: "Rides & Events", subtitle: "Thrills & shows", step: steps.RIDE_EVENT_DETAILS, color: "#EA580C", tint: "#FFEEE2" },
    { icon: "dining", label: "Dining & Menu", subtitle: "Eat & drink", step: steps.DINING_MENU, color: "#DB2777", tint: "#FFE7F1" },
    { icon: "clock", label: "Wait Times", subtitle: "Live queues", step: steps.LIVE_RIDE_WAIT_TIME, color: "#15803D", tint: "#E4F7EA" },
    { icon: "ruler", label: "Ride Guidelines", subtitle: "Height & rules", step: steps.RIDE_GUIDELINES, color: "#4F46E5", tint: "#ECEBFF" },
    { icon: "waves", label: "Wave & Rain Dance", subtitle: "Splash timings", step: steps.WAVE_POOL_RAIN_DANCE, color: "#0E7490", tint: "#E0F7FB" },
    { icon: "shield", label: "Safety & Hygiene", subtitle: "Your wellbeing", step: steps.SAFETY_AND_HYGIENE_INFO, color: "#047857", tint: "#E2F6EF" },
    { icon: "wrench", label: "Maintenance Log", subtitle: "Service records", step: steps.MAINTENANCE_LOG, color: "#475569", tint: "#EEF1F5" },
  ];

  return (
    <div className="min-h-screen bg-blue">
      {/* Logo bar */}
      <header className="flex justify-center bg-white px-5 py-3 shadow-sm">
        <Wordmark logoUrl={logo} />
      </header>

      <div className="px-5 pb-10 pt-5">
        {/* Hero banner — single focal image, clean */}
        <div className="relative h-[180px] overflow-hidden rounded-3xl shadow-lg">
          {heroImage ? (
            <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#3550d6] to-[#1b2a7a]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1230]/90 via-[#0B1230]/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <span className="inline-block rounded-full bg-yellow px-3 py-0.5 font-mulish text-[10px] font-extrabold uppercase tracking-wide text-[#0F1C3F]">
              Scan • Explore • Enjoy
            </span>
            <h1 className="mt-2 font-anton text-[clamp(30px,9vw,42px)] uppercase leading-[0.9] tracking-tight text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">
              Welcome to<br />Wonderla
            </h1>
            {parkName && <p className="mt-1 font-mulish text-sm font-bold text-yellow">📍 {parkName}</p>}
          </div>
        </div>

        {/* Section heading */}
        <h2 className="mb-3 mt-7 font-anton text-lg uppercase tracking-tight text-white/90">
          Explore the Park
        </h2>

        {/* Clean card grid */}
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => updateStep(t.step)}
              className="flex items-start gap-3 rounded-2xl bg-white p-3.5 text-left shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition active:scale-[0.97]"
            >
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: t.tint, color: t.color }}
              >
                <Icon name={t.icon} />
              </span>
              <span className="min-w-0 flex-1 pt-0.5">
                <span className="block font-anton text-[15px] uppercase leading-[1.05] tracking-tight text-[#0F1C3F]">
                  {t.label}
                </span>
                <span className="mt-0.5 block font-mulish text-[11px] leading-tight text-[#0F1C3F]/55">
                  {t.subtitle}
                </span>
              </span>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center font-mulish text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">
          Have a Wonder-ful day!
        </p>
      </div>
    </div>
  );
};

export default LandingStep;
