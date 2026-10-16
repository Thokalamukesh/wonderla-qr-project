/* ============================================================
   Server-side JSON file store for park configurations.
   - One file per park: data/qr-code/parks/<slug>.json
   - Auto-seeds the initial 5 parks on first access.
   - All functions are server-only (use node fs). Never import
     this into a client component.
============================================================ */

import { promises as fs } from "fs";
import path from "path";
import { PARKS_DIR } from "./paths";
import { createBlankParkConfig, createDefaultParkConfig, SEED_PARKS, slugify } from "./config.data";
import type { ParkConfig, ParkSummary } from "./types";

async function ensureDir() {
  await fs.mkdir(PARKS_DIR, { recursive: true });
}

function fileFor(slug: string) {
  return path.join(PARKS_DIR, `${slug}.json`);
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/** Seed the initial parks exactly once (only if the folder is empty). */
async function ensureSeeded() {
  await ensureDir();
  const entries = (await fs.readdir(PARKS_DIR)).filter((f) => f.endsWith(".json"));
  if (entries.length > 0) return;
  await Promise.all(
    SEED_PARKS.map((p) =>
      fs.writeFile(
        fileFor(p.slug),
        JSON.stringify(createDefaultParkConfig(p.name, p.location, p.slug), null, 2),
        "utf8"
      )
    )
  );
}

export async function listParks(): Promise<ParkSummary[]> {
  await ensureSeeded();
  const files = (await fs.readdir(PARKS_DIR)).filter((f) => f.endsWith(".json"));
  const parks = (await Promise.all(files.map(async (f): Promise<ParkSummary | null> => {
    try {
      const raw = await fs.readFile(path.join(PARKS_DIR, f), "utf8");
      const cfg = JSON.parse(raw) as ParkConfig;
      return {
        slug: cfg.slug,
        name: cfg.name,
        location: cfg.location,
        active: cfg.active,
        updatedAt: cfg.updatedAt,
      };
    } catch {
      /* skip malformed file */
      return null;
    }
  }))).filter((park): park is ParkSummary => park !== null);
  return parks.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPark(slug: string): Promise<ParkConfig | null> {
  await ensureSeeded();
  try {
    return JSON.parse(await fs.readFile(fileFor(slug), "utf8")) as ParkConfig;
  } catch {
    return null;
  }
}

export async function savePark(config: ParkConfig): Promise<ParkConfig> {
  await ensureDir();
  if (!config.slug) throw new Error("Park slug is required");
  const next: ParkConfig = { ...config, updatedAt: new Date().toISOString() };
  const target = fileFor(next.slug);
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(next, null, 2), { encoding: "utf8", flag: "wx" });
  await fs.rename(temporary, target);
  return next;
}

export async function createPark(
  name: string,
  location: string,
  rawSlug?: string
): Promise<ParkConfig> {
  await ensureSeeded();
  const slug = slugify(rawSlug || name);
  if (!slug) throw new Error("A valid name or slug is required");
  if (await exists(fileFor(slug))) {
    throw new Error(`A park with slug "${slug}" already exists`);
  }
  const cfg = createBlankParkConfig(name, location, slug);
  return savePark(cfg);
}

export async function deletePark(slug: string): Promise<boolean> {
  const p = fileFor(slug);
  if (!(await exists(p))) return false;
  await fs.unlink(p);
  return true;
}
