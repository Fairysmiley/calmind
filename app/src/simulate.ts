import { loadRiskConfig, loadWeather, loadWellbeing } from "./data/loaders";
import { RiskEngine, formatInsight } from "./agent/riskEngine";

const wellbeing = loadWellbeing();
const weather = loadWeather();
const config = loadRiskConfig();

const engine = new RiskEngine(config, weather);

console.log("📱 CalmMind agent simulation\n");
wellbeing.forEach((day) => {
  const insight = engine.evaluateDay(day);
  const shouldNudge = insight.score >= config.riskThreshold;
  console.log(formatInsight(insight));
  if (shouldNudge) {
    console.log(`→ ACTION: ${insight.action}\n`);
  } else {
    console.log("→ No action (safe range)\n");
  }
});

