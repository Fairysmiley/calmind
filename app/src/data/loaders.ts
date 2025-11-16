import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RiskConfig, WeatherDay, WellbeingDay } from "../types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../..");

const readJson = <T>(relative: string): T => {
  const absPath = path.join(ROOT, relative);
  const raw = fs.readFileSync(absPath, "utf8");
  return JSON.parse(raw) as T;
};

export const loadWellbeing = (): WellbeingDay[] =>
  readJson<{ days: WellbeingDay[] }>("data/mock_wellbeing.json").days;

export const loadWeather = (): WeatherDay[] =>
  readJson<{ days: WeatherDay[] }>("data/mock_weather.json").days;

export const loadRiskConfig = (): RiskConfig =>
  readJson<RiskConfig>("data/risk_thresholds.json");

