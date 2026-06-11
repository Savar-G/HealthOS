import type { NextConfig } from "next";

// Data files live outside src/ and are read via fs at request time
// (all pages are force-dynamic), so Vercel must bundle them explicitly.
const dataFiles = [
  "./coach_notes.md",
  "./data/weight.csv",
  "./oura/Oura_Profile.md",
  "./oura/Recovery_Log.md",
  "./running/Run Log.md",
  "./running/Training Plan.md",
  "./strength/strong_workouts_raw.csv",
];

const nextConfig: NextConfig = {
  // A stray package-lock.json in the home directory makes Next.js infer the
  // wrong workspace root — pin it to this project.
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname,
  outputFileTracingIncludes: {
    "/": dataFiles,
    "/training": dataFiles,
    "/sleep": dataFiles,
    "/body": dataFiles,
    "/insights": dataFiles,
  },
};

export default nextConfig;
