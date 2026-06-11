import fs from "fs";
import path from "path";

const STATS_FILE = path.join(process.cwd(), "data", "stats.json");

export function getStats() {
  try {
    if (!fs.existsSync(path.dirname(STATS_FILE))) {
      fs.mkdirSync(path.dirname(STATS_FILE), { recursive: true });
    }
    if (!fs.existsSync(STATS_FILE)) {
      const initialStats = { lyricsForged: 1042, activeCreators: 1005 };
      fs.writeFileSync(STATS_FILE, JSON.stringify(initialStats, null, 2));
      return initialStats;
    }
    const data = fs.readFileSync(STATS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return { lyricsForged: 1042, activeCreators: 1005 };
  }
}

export function saveStats(stats: any) {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error("Failed to save stats", error);
  }
}

export function incrementStats(type: "lyrics" | "visitor", amount = 1) {
  const stats = getStats();
  if (type === "lyrics") {
    stats.lyricsForged += amount;
  } else if (type === "visitor") {
    stats.activeCreators += amount;
  }
  saveStats(stats);
  return stats;
}
