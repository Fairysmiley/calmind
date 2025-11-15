import dayjs from "dayjs";
import {
  RiskConfig,
  RiskInsight,
  WeatherDay,
  WellbeingDay,
} from "../types/types";

export class RiskEngine {
  constructor(private config: RiskConfig, private weather: WeatherDay[]) {}

  evaluateDay(day: WellbeingDay): RiskInsight {
    const weather = this.weather.find((d) => d.date === day.date);
    const features = this.buildFeatureVector(day, weather);
    const z = Object.entries(features).reduce(
      (acc, [key, value]) => acc + (this.config.weights[key] ?? 0) * value,
      this.config.bias
    );
    const score = 1 / (1 + Math.exp(-z));

    const drivers = this.identifyDrivers(features, score);
    const action = this.selectAction(day, score);
    const recommendation = this.buildRecommendation(drivers, action);

    return {
      date: day.date,
      score: Number(score.toFixed(2)),
      drivers,
      recommendation,
      action,
    };
  }

  private buildFeatureVector(day: WellbeingDay, weather?: WeatherDay) {
    const baselineMinutes = 240;
    const baselinePickups = 60;
    const baselineNotifications = 180;

    const pressureDrop =
      weather && this.weather[0]
        ? this.weather[0].pressureHpa - weather.pressureHpa
        : 0;

    return {
      screenMinutes: day.screenMinutes / baselineMinutes,
      longestSessionMinutes: day.longestSessionMinutes / 60,
      pickups: day.pickups / baselinePickups,
      notifications: day.notifications / baselineNotifications,
      bedtimeModeUsed: day.bedtimeModeUsed ? 1 : 0,
      dndMinutes: day.dndMinutes / 60,
      stressMeetings: day.stressMeetings / 4,
      pressureDrop: Math.max(0, pressureDrop) / 10,
      stormAlert: weather?.stormAlert ? 1 : 0,
    };
  }

  private identifyDrivers(features: Record<string, number>, score: number) {
    const strongDrivers = Object.entries(features)
      .filter(([key]) => key !== "bedtimeModeUsed" && key !== "dndMinutes")
      .sort(
        (a, b) =>
          (this.config.weights[b[0]] ?? 0) * Math.abs(b[1]) -
          (this.config.weights[a[0]] ?? 0) * Math.abs(a[1])
      )
      .slice(0, 3)
      .map(([key]) => this.prettyLabel(key));

    if (score < this.config.riskThreshold && features.bedtimeModeUsed >= 1) {
      strongDrivers.push("consistent bedtime mode");
    }

    return strongDrivers;
  }

  private selectAction(day: WellbeingDay, score: number) {
    if (score >= 0.9 || day.longestSessionMinutes > 120) {
      return "dim_screen";
    }
    if (!day.bedtimeModeUsed || day.pickups > 100) {
      return "enable_dnd";
    }
    return "hydrate_reminder";
  }

  private buildRecommendation(
    drivers: string[],
    action: RiskInsight["action"]
  ) {
    const driverSummary = drivers.length
      ? drivers.join(", ")
      : "baseline stability";
    const actionCopy: Record<RiskInsight["action"], string> = {
      dim_screen: "Let me dim the display and lower blue light exposure.",
      enable_dnd: "I’ll enable DND + bedtime mode for the next hour.",
      hydrate_reminder: "Take a water break and stretch for two minutes.",
    };
    return `Drivers: ${driverSummary}. ${actionCopy[action]}`;
  }

  private prettyLabel(key: string) {
    const map: Record<string, string> = {
      screenMinutes: "extended screen time",
      longestSessionMinutes: "long continuous session",
      pickups: "frequent pickups",
      notifications: "high notification load",
      stressMeetings: "packed meeting schedule",
      pressureDrop: "pressure drop",
      stormAlert: "incoming storm",
    };
    return map[key] ?? key;
  }
}

export const formatInsight = (insight: RiskInsight) => {
  const date = dayjs(insight.date).format("MMM D");
  return `[${date}] Score ${insight.score} → ${insight.recommendation}`;
};
