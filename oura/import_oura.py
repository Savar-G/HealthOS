#!/usr/bin/env python3
"""
Oura CSV Import Script
Reads exported Oura CSVs from raw/, deduplicates against Recovery_Log.md,
and appends new entries. On first run, imports last 90 days as detailed
entries and uses full history for baselines.
"""

import csv
import re
import os
from datetime import datetime, timedelta
from collections import defaultdict
from pathlib import Path

RAW_DIR = Path(__file__).parent / "raw"
RECOVERY_LOG = Path(__file__).parent / "Recovery_Log.md"
OURA_PROFILE = Path(__file__).parent / "Oura_Profile.md"

DETAIL_WINDOW_DAYS = 90  # How many days of detailed entries to keep in log


def read_csv(filename):
    """Read semicolon-delimited Oura CSV, return list of dicts."""
    filepath = RAW_DIR / filename
    if not filepath.exists():
        return []
    with open(filepath, "r") as f:
        reader = csv.DictReader(f, delimiter=";")
        return list(reader)


def get_last_logged_date():
    """Find the last date already in Recovery_Log.md."""
    if not RECOVERY_LOG.exists():
        return None
    content = RECOVERY_LOG.read_text()
    dates = re.findall(r"### (\d{4}-\d{2}-\d{2})", content)
    if dates:
        return max(dates)
    return None


def parse_sleep_data():
    """Parse sleepmodel.csv — get primary sleep session per night."""
    rows = read_csv("sleepmodel.csv")
    sleep_by_day = {}
    for row in rows:
        day = row.get("day", "")
        if not day:
            continue
        sleep_type = row.get("type", "")
        # Prefer "long_sleep" over naps; if multiple, take the longest
        duration = int(row.get("total_sleep_duration", 0) or 0)
        if day not in sleep_by_day or (
            sleep_type == "long_sleep"
            and sleep_by_day[day].get("type") != "long_sleep"
        ) or (
            sleep_type == sleep_by_day[day].get("type")
            and duration > int(sleep_by_day[day].get("total_sleep_duration", 0) or 0)
        ):
            sleep_by_day[day] = row
    return sleep_by_day


def parse_readiness():
    """Parse dailyreadiness.csv."""
    rows = read_csv("dailyreadiness.csv")
    by_day = {}
    for row in rows:
        day = row.get("day", "")
        if day:
            by_day[day] = row
    return by_day


def parse_daily_sleep_score():
    """Parse dailysleep.csv for the sleep score."""
    rows = read_csv("dailysleep.csv")
    by_day = {}
    for row in rows:
        day = row.get("day", "")
        if day:
            by_day[day] = row
    return by_day


def parse_activity():
    """Parse dailyactivity.csv."""
    rows = read_csv("dailyactivity.csv")
    by_day = {}
    for row in rows:
        day = row.get("day", "")
        if day:
            by_day[day] = row
    return by_day


def parse_resilience():
    """Parse dailyresilience.csv."""
    rows = read_csv("dailyresilience.csv")
    by_day = {}
    for row in rows:
        day = row.get("day", "")
        if day:
            by_day[day] = row
    return by_day


def seconds_to_hm(seconds):
    """Convert seconds to Xh Xm format."""
    try:
        s = int(seconds)
    except (ValueError, TypeError):
        return "—"
    h = s // 3600
    m = (s % 3600) // 60
    if h > 0:
        return f"{h}h {m}m"
    return f"{m}m"


def safe_int(val):
    try:
        return int(val)
    except (ValueError, TypeError):
        return None


def safe_float(val):
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def compute_trend(values, current):
    """Compare current to 7-day avg of prior values. Return arrow."""
    if current is None or len(values) < 2:
        return "→"
    recent = [v for v in values[-7:] if v is not None]
    if not recent:
        return "→"
    avg = sum(recent) / len(recent)
    diff_pct = (current - avg) / avg * 100 if avg != 0 else 0
    if diff_pct > 5:
        return "↑"
    elif diff_pct < -5:
        return "↓"
    return "→"


def build_daily_records():
    """Merge all CSVs into unified daily records."""
    sleep_data = parse_sleep_data()
    readiness_data = parse_readiness()
    sleep_scores = parse_daily_sleep_score()
    activity_data = parse_activity()
    resilience_data = parse_resilience()

    all_dates = sorted(
        set(
            list(sleep_data.keys())
            + list(readiness_data.keys())
            + list(sleep_scores.keys())
            + list(activity_data.keys())
        )
    )

    records = []
    for day in all_dates:
        rec = {"day": day}

        # Readiness
        if day in readiness_data:
            r = readiness_data[day]
            rec["readiness_score"] = safe_int(r.get("score"))
            rec["temp_dev"] = safe_float(r.get("temperature_deviation"))

        # Sleep score
        if day in sleep_scores:
            rec["sleep_score"] = safe_int(sleep_scores[day].get("score"))

        # Sleep details (from sleepmodel)
        if day in sleep_data:
            s = sleep_data[day]
            rec["avg_hrv"] = safe_int(s.get("average_hrv"))
            rec["avg_hr"] = safe_float(s.get("average_heart_rate"))
            rec["lowest_hr"] = safe_int(s.get("lowest_heart_rate"))
            rec["deep_sleep_sec"] = safe_int(s.get("deep_sleep_duration"))
            rec["total_sleep_sec"] = safe_int(s.get("total_sleep_duration"))
            rec["rem_sleep_sec"] = safe_int(s.get("rem_sleep_duration"))
            rec["efficiency"] = safe_int(s.get("efficiency"))

        # Activity
        if day in activity_data:
            a = activity_data[day]
            rec["activity_score"] = safe_int(a.get("score"))
            rec["steps"] = safe_int(a.get("steps"))
            rec["active_calories"] = safe_int(a.get("active_calories"))

        # Resilience
        if day in resilience_data:
            rec["resilience_level"] = resilience_data[day].get("level", "")

        records.append(rec)

    return records


def format_entry(rec, prev_records):
    """Format a single day's record as markdown."""
    day = rec["day"]

    # Compute trends from previous records
    prev_readiness = [r.get("readiness_score") for r in prev_records]
    prev_sleep = [r.get("sleep_score") for r in prev_records]
    prev_hrv = [r.get("avg_hrv") for r in prev_records]
    prev_hr = [r.get("avg_hr") for r in prev_records]
    prev_deep = [r.get("deep_sleep_sec") for r in prev_records]
    prev_activity = [r.get("activity_score") for r in prev_records]

    readiness = rec.get("readiness_score")
    sleep_score = rec.get("sleep_score")
    hrv = rec.get("avg_hrv")
    avg_hr = rec.get("avg_hr")
    lowest_hr = rec.get("lowest_hr")
    deep_sec = rec.get("deep_sleep_sec")
    total_sec = rec.get("total_sleep_sec")
    temp_dev = rec.get("temp_dev")
    activity = rec.get("activity_score")
    steps = rec.get("steps")

    lines = [f"### {day}", ""]
    lines.append("| Metric | Value | Trend |")
    lines.append("|--------|-------|-------|")

    lines.append(f"| Readiness Score | {readiness or '—'} | {compute_trend(prev_readiness, readiness)} |")
    lines.append(f"| Sleep Score | {sleep_score or '—'} | {compute_trend(prev_sleep, sleep_score)} |")
    lines.append(f"| HRV | {f'{hrv} ms' if hrv else '—'} | {compute_trend(prev_hrv, hrv)} |")

    hr_display = f"{avg_hr:.0f} bpm" if avg_hr else "—"
    lines.append(f"| Resting HR | {hr_display} | {compute_trend(prev_hr, avg_hr)} |")

    lines.append(f"| Lowest HR | {f'{lowest_hr} bpm' if lowest_hr else '—'} | |")
    lines.append(f"| Deep Sleep | {seconds_to_hm(deep_sec) if deep_sec else '—'} | {compute_trend(prev_deep, deep_sec)} |")
    lines.append(f"| Total Sleep | {seconds_to_hm(total_sec) if total_sec else '—'} | |")

    temp_str = f"{temp_dev:+.2f}°C" if temp_dev is not None else "—"
    lines.append(f"| Body Temp Dev | {temp_str} | |")

    lines.append(f"| Activity Score | {activity or '—'} | {compute_trend(prev_activity, activity)} |")

    if steps:
        lines.append(f"| Steps | {steps:,} | |")

    lines.append("")
    return "\n".join(lines)


def compute_baselines(records):
    """Compute baseline stats from full history."""
    stats = {
        "total_days": len(records),
        "first_date": records[0]["day"] if records else "—",
        "last_date": records[-1]["day"] if records else "—",
    }

    for key, field in [
        ("readiness", "readiness_score"),
        ("sleep", "sleep_score"),
        ("hrv", "avg_hrv"),
        ("resting_hr", "avg_hr"),
        ("deep_sleep_sec", "deep_sleep_sec"),
        ("activity", "activity_score"),
    ]:
        vals = [r[field] for r in records if r.get(field) is not None]
        if vals:
            stats[f"{key}_avg"] = sum(vals) / len(vals)
            stats[f"{key}_min"] = min(vals)
            stats[f"{key}_max"] = max(vals)
            stats[f"{key}_count"] = len(vals)
        else:
            stats[f"{key}_avg"] = None

    return stats


def compute_recent_stats(records, days=7):
    """Compute stats for the most recent N days."""
    recent = records[-days:] if len(records) >= days else records
    return compute_baselines(recent)


def generate_profile(records):
    """Generate Oura_Profile.md content."""
    all_stats = compute_baselines(records)
    recent_7 = compute_recent_stats(records, 7)
    recent_30 = compute_recent_stats(records, 30)

    last_rec = records[-1] if records else {}

    # Determine recovery status
    recent_readiness = [r.get("readiness_score") for r in records[-7:] if r.get("readiness_score")]
    avg_readiness_7d = sum(recent_readiness) / len(recent_readiness) if recent_readiness else 0

    recent_hrv = [r.get("avg_hrv") for r in records[-7:] if r.get("avg_hrv")]
    avg_hrv_7d = sum(recent_hrv) / len(recent_hrv) if recent_hrv else 0

    recent_hr = [r.get("avg_hr") for r in records[-7:] if r.get("avg_hr")]
    avg_hr_7d = sum(recent_hr) / len(recent_hr) if recent_hr else 0

    recent_sleep = [r.get("sleep_score") for r in records[-7:] if r.get("sleep_score")]
    avg_sleep_7d = sum(recent_sleep) / len(recent_sleep) if recent_sleep else 0

    # HRV trend (7d vs 30d)
    hrv_30 = [r.get("avg_hrv") for r in records[-30:] if r.get("avg_hrv")]
    avg_hrv_30d = sum(hrv_30) / len(hrv_30) if hrv_30 else avg_hrv_7d

    if avg_hrv_7d > avg_hrv_30d * 1.05:
        hrv_trend = "↑"
    elif avg_hrv_7d < avg_hrv_30d * 0.95:
        hrv_trend = "↓"
    else:
        hrv_trend = "→"

    # HR trend
    hr_30 = [r.get("avg_hr") for r in records[-30:] if r.get("avg_hr")]
    avg_hr_30d = sum(hr_30) / len(hr_30) if hr_30 else avg_hr_7d
    if avg_hr_7d < avg_hr_30d * 0.97:
        hr_trend = "↓ (good)"
    elif avg_hr_7d > avg_hr_30d * 1.03:
        hr_trend = "↑ (elevated)"
    else:
        hr_trend = "→"

    # Sleep quality trend
    sleep_30 = [r.get("sleep_score") for r in records[-30:] if r.get("sleep_score")]
    avg_sleep_30d = sum(sleep_30) / len(sleep_30) if sleep_30 else avg_sleep_7d
    if avg_sleep_7d > avg_sleep_30d + 3:
        sleep_trend = "improving"
    elif avg_sleep_7d < avg_sleep_30d - 3:
        sleep_trend = "declining"
    else:
        sleep_trend = "stable"

    # Recovery status
    if avg_readiness_7d >= 75 and avg_hrv_7d >= avg_hrv_30d * 0.95:
        recovery_status = "🟢 Green"
    elif avg_readiness_7d >= 65:
        recovery_status = "🟡 Yellow"
    else:
        recovery_status = "🔴 Red"

    # Analyst note
    notes = []
    if avg_readiness_7d >= 80:
        notes.append("Body is well-recovered and ready for training load.")
    elif avg_readiness_7d >= 70:
        notes.append("Recovery is adequate — normal training is fine.")
    else:
        notes.append("Recovery is low — consider lighter sessions.")

    if hrv_trend == "↓":
        notes.append("HRV is trending down — watch for accumulated fatigue.")
    elif hrv_trend == "↑":
        notes.append("HRV is trending up — good adaptation signal.")

    analyst_note = " ".join(notes)

    def fmt(val, spec=".0f", suffix=""):
        if val is None:
            return "—"
        return f"{val:{spec}}{suffix}"

    # Build profile content using safe formatting
    lines = []
    lines.append("# Oura Profile")
    lines.append("")
    lines.append("## State of My Recovery")
    lines.append(f"- **Last entry:** {last_rec.get('day', '—')}")
    lines.append(f"- **7-day avg HRV:** {fmt(avg_hrv_7d)} ms {hrv_trend}")
    lines.append(f"- **7-day avg resting HR:** {fmt(avg_hr_7d, '.1f')} bpm {hr_trend}")
    lines.append(f"- **7-day avg readiness:** {fmt(avg_readiness_7d)}")
    lines.append(f"- **Sleep quality trend:** {sleep_trend}")
    lines.append(f"- **Current recovery status:** {recovery_status}")
    lines.append(f"- **Analyst note:** {analyst_note}")
    lines.append("")
    lines.append(f"## All-Time Baselines ({all_stats['total_days']} days: {all_stats['first_date']} → {all_stats['last_date']})")
    lines.append("")
    lines.append("| Metric | Average | Min | Max |")
    lines.append("|--------|---------|-----|-----|")
    lines.append(f"| Readiness | {fmt(all_stats['readiness_avg'])} | {fmt(all_stats.get('readiness_min'))} | {fmt(all_stats.get('readiness_max'))} |")
    lines.append(f"| Sleep Score | {fmt(all_stats['sleep_avg'])} | {fmt(all_stats.get('sleep_min'))} | {fmt(all_stats.get('sleep_max'))} |")
    lines.append(f"| HRV | {fmt(all_stats['hrv_avg'])} ms | {fmt(all_stats.get('hrv_min'))} ms | {fmt(all_stats.get('hrv_max'))} ms |")
    lines.append(f"| Resting HR | {fmt(all_stats['resting_hr_avg'], '.1f')} bpm | {fmt(all_stats.get('resting_hr_min'), '.0f')} bpm | {fmt(all_stats.get('resting_hr_max'), '.0f')} bpm |")
    lines.append(f"| Deep Sleep | {seconds_to_hm(all_stats.get('deep_sleep_sec_avg'))} | {seconds_to_hm(all_stats.get('deep_sleep_sec_min'))} | {seconds_to_hm(all_stats.get('deep_sleep_sec_max'))} |")
    lines.append(f"| Activity | {fmt(all_stats['activity_avg'])} | {fmt(all_stats.get('activity_min'))} | {fmt(all_stats.get('activity_max'))} |")
    lines.append("")
    lines.append("## 30-Day Snapshot")
    lines.append("")
    lines.append("| Metric | 30-day Avg | 7-day Avg | Direction |")
    lines.append("|--------|-----------|-----------|-----------|")

    r30_readiness = recent_30.get('readiness_avg') or 0
    readiness_dir = '↑' if avg_readiness_7d > r30_readiness else '↓' if avg_readiness_7d < r30_readiness else '→'
    lines.append(f"| Readiness | {fmt(recent_30.get('readiness_avg'))} | {fmt(avg_readiness_7d)} | {readiness_dir} |")
    lines.append(f"| HRV | {fmt(avg_hrv_30d)} ms | {fmt(avg_hrv_7d)} ms | {hrv_trend} |")
    lines.append(f"| Resting HR | {fmt(avg_hr_30d, '.1f')} bpm | {fmt(avg_hr_7d, '.1f')} bpm | {hr_trend} |")

    sleep_dir = '↑' if avg_sleep_7d > avg_sleep_30d + 2 else '↓' if avg_sleep_7d < avg_sleep_30d - 2 else '→'
    lines.append(f"| Sleep Score | {fmt(avg_sleep_30d)} | {fmt(avg_sleep_7d)} | {sleep_dir} |")
    lines.append("")
    lines.append("## Patterns & Notes")
    lines.append("<!-- Updated as trends emerge -->")
    lines.append("")

    content = "\n".join(lines)
    return content


def main():
    print("📊 Oura CSV Import")
    print("=" * 50)

    # Check what files exist
    csv_files = list(RAW_DIR.glob("*.csv"))
    print(f"Found {len(csv_files)} CSV files in raw/")
    for f in sorted(csv_files):
        print(f"  - {f.name} ({f.stat().st_size / 1024:.0f} KB)")

    # Get last logged date
    last_logged = get_last_logged_date()
    if last_logged:
        print(f"\nLast logged date in Recovery_Log.md: {last_logged}")
    else:
        print("\nNo existing entries — first import (full history)")

    # Build all daily records
    print("\nParsing CSVs...")
    records = build_daily_records()
    print(f"Total daily records found: {len(records)}")

    if not records:
        print("No records found. Check that CSV files are in raw/")
        return

    print(f"Date range: {records[0]['day']} → {records[-1]['day']}")

    # Filter to new records only
    if last_logged:
        new_records = [r for r in records if r["day"] > last_logged]
        print(f"New records to import: {len(new_records)}")
    else:
        new_records = records
        print(f"First import — all {len(new_records)} records are new")

    if not new_records:
        print("\n✅ No new data to import — Recovery_Log.md is up to date.")
        return

    # Determine which records get detailed entries in the log
    # On first import: last 90 days detailed
    # On subsequent: all new records get detailed entries
    if last_logged:
        detail_records = new_records
    else:
        cutoff = (datetime.now() - timedelta(days=DETAIL_WINDOW_DAYS)).strftime("%Y-%m-%d")
        detail_records = [r for r in new_records if r["day"] >= cutoff]
        older_count = len(new_records) - len(detail_records)
        if older_count > 0:
            print(f"  → {older_count} older records used for baselines only")
            print(f"  → {len(detail_records)} recent records written as detailed entries")

    # Generate detailed log entries
    print("\nGenerating Recovery_Log.md entries...")
    entries = []
    for i, rec in enumerate(detail_records):
        # Get preceding records for trend calculation
        rec_idx = records.index(rec)
        prev = records[max(0, rec_idx - 7):rec_idx]
        entries.append(format_entry(rec, prev))

    # Write/append to Recovery_Log.md
    if last_logged:
        # Append to existing
        existing = RECOVERY_LOG.read_text()
        new_content = existing.rstrip() + "\n\n" + "\n".join(entries)
    else:
        # First import — write header + entries
        new_content = "# Recovery Log\n\n" + "\n".join(entries)

    RECOVERY_LOG.write_text(new_content)
    print(f"✅ Wrote {len(detail_records)} entries to Recovery_Log.md")

    # Generate Oura_Profile.md with baselines from ALL data
    print("\nGenerating Oura_Profile.md with baselines...")
    profile_content = generate_profile(records)
    OURA_PROFILE.write_text(profile_content)
    print("✅ Updated Oura_Profile.md")

    # Summary
    print("\n" + "=" * 50)
    print("📋 Import Summary")
    print(f"  Total history: {len(records)} days ({records[0]['day']} → {records[-1]['day']})")
    print(f"  New entries added: {len(detail_records)}")

    # Quick stats on recent data
    recent_7 = records[-7:]
    hrv_vals = [r["avg_hrv"] for r in recent_7 if r.get("avg_hrv")]
    readiness_vals = [r["readiness_score"] for r in recent_7 if r.get("readiness_score")]

    if hrv_vals:
        print(f"  7-day avg HRV: {sum(hrv_vals)/len(hrv_vals):.0f} ms")
    if readiness_vals:
        print(f"  7-day avg readiness: {sum(readiness_vals)/len(readiness_vals):.0f}")


if __name__ == "__main__":
    main()
