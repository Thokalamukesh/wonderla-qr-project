import React from "react";
import Link from "next/link";
import { Oswald } from "next/font/google";
import { listParks } from "./_lib/store";

const oswald = Oswald({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

/**
 * Park index. Each park's QR code points directly to /qr-code/<slug>,
 * so this page is mainly a human-friendly directory + link to admin.
 */
const QrCodeIndex = async () => {
  const parks = (await listParks()).filter((p) => p.active);

  return (
    <main className="mx-auto min-h-screen max-w-[480px] bg-[#2A41B1] px-8 py-10">
      <h3 className={`text-center text-[clamp(18px,6vw,24px)] font-bold uppercase text-white ${oswald.className}`}>
        Welcome To
      </h3>
      <h1 className={`mb-8 text-center text-[clamp(36px,12vw,52px)] font-bold uppercase text-white ${oswald.className}`}>
        Wonderla
      </h1>

      <p className="mb-4 text-center font-mulish text-sm text-white/80">Select your park</p>

      <section className="flex flex-col gap-4">
        {parks.map((park) => (
          <Link
            key={park.slug}
            href={`/qr-code/${park.slug}`}
            className="w-full rounded-[10px] bg-white p-5"
          >
            <p className="mulish text-sm font-extrabold text-[#22304A]">{park.name}</p>
            {park.location && (
              <p className="mulish text-xs text-[#22304A]/70">{park.location}</p>
            )}
          </Link>
        ))}
        {parks.length === 0 && (
          <p className="text-center font-mulish text-sm text-white/80">
            No parks configured yet. Add one from the admin panel.
          </p>
        )}
      </section>

      <div className="mt-10 text-center">
        <Link href="/qr-code/admin" className="font-mulish text-xs font-bold text-white/70 underline">
          Admin login
        </Link>
      </div>
    </main>
  );
};

export default QrCodeIndex;
