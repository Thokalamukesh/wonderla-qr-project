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

interface Tile {
  icon: keyof LandingIcons;
  label: string;
  subtitle: string;
  step: StepValue;
}

const LandingStep = ({ updateStep, parkName, logoUrl, heroImage, icons }: Props) => {
  const tileIcons = { ...DEFAULT_LANDING_ICONS, ...(icons || {}) };
  const tiles: Tile[] = [
    { icon: "ridesEvents", label: "Rides & events", subtitle: "Find your next thrill", step: steps.RIDE_EVENT_DETAILS },
    { icon: "dining", label: "Food & dining", subtitle: "Menus, meals & more", step: steps.DINING_MENU },
    { icon: "waitTimes", label: "Wait times", subtitle: "See ride queues", step: steps.LIVE_RIDE_WAIT_TIME },
    { icon: "wavePool", label: "Water attractions", subtitle: "Wave pool & sessions", step: steps.WAVE_POOL_RAIN_DANCE },
    { icon: "guidelines", label: "Ride guidelines", subtitle: "Height limits & tips", step: steps.RIDE_GUIDELINES },
    { icon: "safety", label: "Safety & hygiene", subtitle: "Feel good, have fun", step: steps.SAFETY_AND_HYGIENE_INFO },
    { icon: "maintenance", label: "Ride updates", subtitle: "Service information", step: steps.MAINTENANCE_LOG },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fc] pb-7">
      <header className="flex h-[68px] items-center justify-between border-b border-[#e7edf7] bg-white px-5">
        <Wordmark logoUrl={logoUrl || "/wonderla/logo.png"} />
        {parkName && (
          <span className="max-w-[46%] truncate rounded-full bg-[#eef3ff] px-3 py-2 font-mulish text-xs font-extrabold text-[#244bb0]">
            <span aria-hidden="true" className="mr-1.5">●</span>{parkName}
          </span>
        )}
      </header>

      <div className="mx-auto max-w-[560px] px-4 pb-2 pt-4 sm:px-5 sm:pt-5">
        <section className="relative isolate min-h-[285px] overflow-hidden rounded-[28px] bg-[#102e7b] shadow-[0_16px_36px_rgba(24,61,154,0.23)] sm:min-h-[320px]" aria-label="Welcome to Wonderla">
          {heroImage && <img src={heroImage} alt="" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover" />}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#091943]/95 via-[#102e7b]/38 to-[#102e7b]/5" />
          <div aria-hidden="true" className="absolute -right-16 -top-24 -z-10 size-64 rounded-full border-[32px] border-white/[0.09]" />
          <div aria-hidden="true" className="absolute -right-6 top-5 -z-10 size-32 rounded-full border border-white/20" />

          <div className="absolute inset-x-0 bottom-0 p-5 pb-6 sm:p-7 sm:pb-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 font-mulish text-[10px] font-extrabold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-[#ffda36]" /> Your day starts here
            </span>
            <h1 className="mt-3 max-w-[420px] font-anton text-[clamp(36px,10vw,50px)] uppercase leading-[0.98] tracking-tight text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.2)]">
              Let the fun<br />take over.
            </h1>
            <p className="mt-2 font-mulish text-sm font-semibold text-white/85">{parkName || "Welcome to Wonderla"}</p>
            <button
              type="button"
              onClick={() => updateStep(steps.PARK_MAP)}
              className="mt-5 inline-flex min-h-11 items-center gap-3 rounded-full bg-white px-5 font-mulish text-sm font-extrabold text-[#183d9a] shadow-lg transition hover:bg-[#f1f5ff] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffda36]"
            >
              Explore park map <span aria-hidden="true" className="text-lg leading-none">→</span>
            </button>
          </div>
        </section>

        <section className="mt-7" aria-labelledby="visit-heading">
          <div className="mb-3 flex items-end justify-between gap-3 px-0.5">
            <div>
              <p className="font-mulish text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#5270b5]">Make the most of today</p>
              <h2 id="visit-heading" className="mt-1 font-anton text-[26px] uppercase leading-none tracking-tight text-[#142653]">Plan your visit</h2>
            </div>
            <span className="pb-0.5 font-mulish text-xs font-semibold text-[#7785a0]">Pick a guide</span>
          </div>

          <button
            type="button"
            onClick={() => updateStep(steps.PARK_MAP)}
            data-scroll-reveal
            className="group mb-3 flex min-h-[92px] w-full items-center gap-3.5 rounded-[20px] border border-[#dce6f8] bg-gradient-to-r from-[#e8efff] to-white p-4 text-left shadow-[0_5px_16px_rgba(36,75,176,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_9px_22px_rgba(36,75,176,0.12)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a9c4ff]"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#244bb0] text-[25px] text-white shadow-[0_5px_12px_rgba(36,75,176,0.25)]" aria-hidden="true">{tileIcons.parkMap}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-anton text-[18px] uppercase leading-tight tracking-tight text-[#142653]">Park map</span>
              <span className="mt-1 block font-mulish text-xs text-[#60708f]">Find rides, food and facilities</span>
            </span>
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-xl text-[#244bb0] shadow-sm transition-transform group-hover:translate-x-0.5">→</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            {tiles.map((tile) => (
              <button
                key={tile.label}
                type="button"
                aria-label={`${tile.label}: ${tile.subtitle}`}
                onClick={() => updateStep(tile.step)}
                data-scroll-reveal
                className="group flex min-h-[112px] flex-col items-start rounded-[18px] border border-[#e2e8f2] bg-white p-3.5 text-left shadow-[0_3px_12px_rgba(26,49,94,0.045)] transition hover:-translate-y-0.5 hover:border-[#bfd0f4] hover:shadow-[0_8px_18px_rgba(26,49,94,0.1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a9c4ff] sm:min-h-[120px] sm:p-4"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#eef3ff] text-xl text-[#244bb0] transition-transform group-hover:scale-105" aria-hidden="true">{tileIcons[tile.icon]}</span>
                <span className="mt-2.5 block font-anton text-[14px] uppercase leading-tight tracking-tight text-[#17274f]">{tile.label}</span>
                <span className="mt-1 block font-mulish text-[11px] leading-snug text-[#74819a]">{tile.subtitle}</span>
              </button>
            ))}
          </div>
        </section>

        <footer className="mt-7 flex items-center justify-center gap-2 font-mulish text-[10px] font-bold uppercase tracking-[0.18em] text-[#8491aa]">
          <span aria-hidden="true" className="text-[#315ec0]">✦</span> Have a Wonder-ful day <span aria-hidden="true" className="text-[#315ec0]">✦</span>
        </footer>
      </div>
    </div>
  );
};

export default LandingStep;
