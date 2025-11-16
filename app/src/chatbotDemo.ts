import { loadRiskConfig, loadWeather, loadWellbeing } from "./data/loaders";
import { RiskEngine } from "./agent/riskEngine";
import {
  generateProactiveTurns,
  handleUserReply
} from "./chatbot/chatbot.js";

const config = loadRiskConfig();
const weather = loadWeather();
const wellbeing = loadWellbeing();
const engine = new RiskEngine(config, weather);

const day = wellbeing.at(-1)!; // latest day
const insight = engine.evaluateDay(day);
const turns = generateProactiveTurns(insight);

console.log("💬 Chatbot mock conversation\n");
turns.forEach((turn) => {
  console.log(`${turn.sender === "agent" ? "CalmMind" : "You"}: ${turn.text}`);
});
console.log("\nYou: Why now?");
const reply = handleUserReply("Why now?", insight);
console.log(`CalmMind: ${reply.text}`);

