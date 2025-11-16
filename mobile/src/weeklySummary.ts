import { RiskEngine } from "../../app/src/agent/riskEngine";
import {
  RiskConfig,
  RiskInsight,
  WellbeingDay,
  WeatherDay
} from "../../app/src/types";

export type WeeklySummary = {
  migrainesPrevented: number;
  strongestDriver: string;
  favoriteAutomation: string;
  recap: string;
  insights: RiskInsight[];
};

const automationLabel: Record<RiskInsight["action"], string> = {
  dim_screen: "Screen dimming shield",
  enable_dnd: "Focus bubble",
  hydrate_reminder: "Hydration cue"
};

export const buildWeeklySummary = (
  days: WellbeingDay[],
  weather: WeatherDay[],
  engine: RiskEngine,
  config: RiskConfig
): WeeklySummary => {
  const insights = days.map((day) => engine.evaluateDay(day));
  const prevented = insights.filter(
    (insight) => insight.score >= config.riskThreshold
  ).length;

  const driverCounts: Record<string, number> = {};
  const automationCounts: Record<string, number> = {};

  insights.forEach((insight) => {
    insight.drivers.forEach((driver) => {
      driverCounts[driver] = (driverCounts[driver] ?? 0) + 1;
    });
    automationCounts[insight.action] = (automationCounts[insight.action] ?? 0) + 1;
  });

  const strongestDriver =
    Object.entries(driverCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "baseline stability";
  const favoriteAutomationKey =
    Object.entries(automationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "hydrate_reminder";

  const recap = `CalmMind quietly intervened ${prevented} times this week. Biggest trigger: ${strongestDriver}. Most helpful automation: ${automationLabel[favoriteAutomationKey as keyof typeof automationLabel]}.`;

  return {
    migrainesPrevented: prevented,
    strongestDriver,
    favoriteAutomation: automationLabel[favoriteAutomationKey as keyof typeof automationLabel],
    recap,
    insights
  };
};

