import React from "react";
import { LeftArrow } from "@/assets/svgs/Icons";

interface Props {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}

/** Brand-blue page header with a round white back button + chunky title. */
const Header = ({ title, onBack, right }: Props) => (
  <section className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-blue px-4 py-5 shadow-md">
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="flex size-9 items-center justify-center rounded-full bg-white shadow-sm transition active:scale-95"
      >
        <LeftArrow />
      </button>
      <h2 className="font-anton text-[26px] uppercase leading-none tracking-tight text-white">
        {title}
      </h2>
    </div>
    {right}
  </section>
);

export default Header;
