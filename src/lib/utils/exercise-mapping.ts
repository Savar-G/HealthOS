import type { MuscleGroup } from "@/lib/types/strength"

/**
 * Maps exercise names (as they appear in strong_workouts_raw.csv)
 * to primary muscle groups. Uses keyword matching for the 237+
 * unique exercise names in the dataset.
 */
const EXACT_MAPPINGS: Record<string, MuscleGroup> = {
  // Quads
  "Leg Extension (Machine)": "Quads",
  "Leg Press": "Quads",
  "Seated Leg Press (Machine)": "Quads",
  "Hack Squat": "Quads",
  "Belt Squat": "Quads",
  "Squat (Barbell)": "Quads",
  "Squat (Smith Machine)": "Quads",
  "Bulgarian Split Squat": "Quads",
  "Front Squat": "Quads",
  "Goblet Squat": "Quads",
  "Leg Press (Machine)": "Quads",
  "Pendulum Squat": "Quads",

  // Hamstrings
  "Romanian Deadlift (Barbell)": "Hamstrings",
  "Lying Leg Curl (Machine)": "Hamstrings",
  "Seated Leg Curl (Machine)": "Hamstrings",
  "Deadlift (Barbell)": "Hamstrings",
  "Sumo Deadlift (Barbell)": "Hamstrings",
  "Trap Bar Deadlift": "Hamstrings",
  "Nordic Hamstring Curl": "Hamstrings",

  // Calves
  "Calf Press on Seated Leg Press": "Calves",
  "Standing Calf Raise (Dumbbell)": "Calves",
  "Standing Calf Raise (Smith Machine)": "Calves",
  "Seated Calf Raise (Plate Loaded)": "Calves",

  // Chest
  "Bench Press (Barbell)": "Chest",
  "Bench Press (Dumbbell)": "Chest",
  "Incline Bench Press (Dumbbell)": "Chest",
  "Incline Bench Press (Smith Machine)": "Chest",
  "Chest Press (Machine)": "Chest",
  "Iso-Lateral Decline Chest Press": "Chest",
  "Iso-Lateral Incline Press": "Chest",
  "Cable Chest Press": "Chest",
  "Cable Incline Press": "Chest",
  "Chest Fly (Dumbbell)": "Chest",
  "Chest Fly (High To Low)": "Chest",
  "Chest Fly (Upper)": "Chest",
  "Cable Crossover": "Chest",
  "Chest Dip": "Chest",
  "Chest Dip (Assisted)": "Chest",
  "Bench Press - Close Grip (Barbell)": "Chest",
  "DB Incline Upper Pec Fly": "Chest",
  "Upper Chest Fly": "Chest",
  "Upper Chest Cable Press": "Chest",

  // Back
  "Lat Pulldown (Cable)": "Back",
  "Seated Row (Machine)": "Back",
  "Seated Row (Cable)": "Back",
  "Chest Supported Lat Pulldown": "Back",
  "Iso Lateral Low Row (Upper Back Focused)": "Back",
  "Iso Lateral Low Row (Upper Back)": "Back",
  "Lat Focus Wide Grip Lat Pulldown": "Back",
  "Iso Lateral Front Lat Pulldown": "Back",
  "Bent Over Row (Barbell)": "Back",
  "Bent Over Row (Dumbbell)": "Back",
  "Bent Over One Arm Row (Dumbbell)": "Back",
  "T Bar Row": "Back",
  "Cable Pullover": "Back",
  "Chin Up": "Back",
  "Pull Up": "Back",
  "Wide Pull Up": "Back",
  "Cable Lat row": "Back",
  "Close grip Lat Pulldown": "Back",
  "Close grip Cable row": "Back",
  "Back Extension": "Back",
  "Upper Back DB Chest Supported Row": "Back",
  "Upper Back Pulldown - Mag Grip": "Back",

  // Shoulders
  "Shoulder Press (Plate Loaded)": "Shoulders",
  "Shoulder Press (Machine)": "Shoulders",
  "Arnold Press (Dumbbell)": "Shoulders",
  "Lateral Raise (Dumbbell)": "Shoulders",
  "Lateral Raise (Machine)": "Shoulders",
  "Both Arm Cable Lateral Raise (Hand Height)": "Shoulders",
  "Cable Lateral Raise (Superset)": "Shoulders",
  "Single Arm Cable Lateral Raise (Hand Height)": "Shoulders",
  "Single Arm Cable Lateral Raise (Cable Below Hand Height)": "Shoulders",
  "DB Chest Supported Lateral Raise": "Shoulders",
  "Seated Lateral Raise": "Shoulders",
  "Seated Overhead Press (Dumbbell)": "Shoulders",
  "Face Pull (Cable)": "Shoulders",
  "Rear Delt Reverse Fly (Dumbbell)": "Shoulders",
  "Rear Delt Fly (Cable)": "Shoulders",
  "Reverse Machine Fly": "Shoulders",
  "Upright Row (Barbell)": "Shoulders",
  "Upright Row (Cable)": "Shoulders",
  "Cable Y Raise": "Shoulders",
  "Y Raise": "Shoulders",
  "DB Chest Supported Y Raise": "Shoulders",

  // Biceps
  "Bicep Curl (Dumbbell)": "Biceps",
  "Bicep Curl (Machine)": "Biceps",
  "Bicep Curl (Barbell)": "Biceps",
  "Bicep Curl (Cable)": "Biceps",
  "Bicep Curl (EZ Bar)": "Biceps",
  "Preacher Curl (Machine)": "Biceps",
  "Hammer Curl (Dumbbell)": "Biceps",
  "Hammer Curl (Cable)": "Biceps",
  "Spider Curl": "Biceps",
  "Cable Curl (single Arm)": "Biceps",
  "Cable Reverse Curl": "Biceps",
  "Corn Curls": "Biceps",

  // Triceps
  "Triceps Pushdown (Cable - Straight Bar)": "Triceps",
  "Tricep Press": "Triceps",
  "Tricep Dips Machine": "Triceps",
  "Triceps Extension (Cable)": "Triceps",
  "Triceps Extension (Dumbbell)": "Triceps",
  "Triceps Extension": "Triceps",
  "Triceps Dip": "Triceps",
  "Single Arm Tricep Extension": "Triceps",
  "Single Arm Rope Extension": "Triceps",
  "Skullcrusher (Barbell)": "Triceps",
  "Skullcrusher (Dumbbell)": "Triceps",
  "Cable Tricep Extension": "Triceps",
  "Cable Kickback": "Triceps",
  "DB Tricep Press": "Triceps",
  "Bench Dip": "Triceps",
  "Tricep Pushdown": "Triceps",
  "Tricep push down V Bar": "Triceps",
  "Tricep push down machine": "Triceps",
  "Cross Body Tricep Extension": "Triceps",
  "Underhand Tricep Pushdown": "Triceps",
  "Unilateral Cable Overhead Extension": "Triceps",

  // Traps
  "Shrug (Dumbbell)": "Traps",
  "Shrug (Machine)": "Traps",
  "Shrug (Smith Machine)": "Traps",

  // Core
  "Cable Crunch": "Core",
  "Crunch (Machine)": "Core",
  "Decline Crunch": "Core",
  "Superman": "Core",
}

/**
 * Keyword-based fallback patterns for exercises not in the exact map.
 * Checked in order — first match wins.
 */
const KEYWORD_PATTERNS: [RegExp, MuscleGroup][] = [
  [/leg\s*ext/i, "Quads"],
  [/squat/i, "Quads"],
  [/leg\s*press/i, "Quads"],
  [/lunge/i, "Quads"],
  [/leg\s*curl|hamstring/i, "Hamstrings"],
  [/deadlift|rdl|romanian/i, "Hamstrings"],
  [/calf|calve/i, "Calves"],
  [/bench|chest\s*(press|fly|dip)|incline.*press|decline.*press|pec/i, "Chest"],
  [/fly.*chest|crossover/i, "Chest"],
  [/lat\s*(pull|focus)|pulldown|pull.*up|chin.*up|row|pullover|back.*ext/i, "Back"],
  [/shoulder.*press|ohp|overhead.*press|lateral.*raise|delt|face.*pull|y\s*raise|rear.*fly|reverse.*fly|upright.*row/i, "Shoulders"],
  [/lateral.*raise|cable.*raise/i, "Shoulders"],
  [/curl|bicep|hammer.*curl|preacher|spider/i, "Biceps"],
  [/tricep|pushdown|skull.*crush|extension.*cable|dip.*machine|kickback/i, "Triceps"],
  [/shrug|trap/i, "Traps"],
  [/crunch|ab|core|plank|superman/i, "Core"],
]

/**
 * Map an exercise name to its primary muscle group.
 * Tries exact match first (with whitespace trimming),
 * then falls back to keyword patterns.
 */
export function exerciseToMuscleGroup(exerciseName: string): MuscleGroup {
  const trimmed = exerciseName.trim()

  // Exact match
  if (EXACT_MAPPINGS[trimmed]) return EXACT_MAPPINGS[trimmed]

  // Try without trailing/leading whitespace variations
  for (const [key, group] of Object.entries(EXACT_MAPPINGS)) {
    if (key.trim().toLowerCase() === trimmed.toLowerCase()) return group
  }

  // Keyword fallback
  for (const [pattern, group] of KEYWORD_PATTERNS) {
    if (pattern.test(trimmed)) return group
  }

  return "Other"
}
