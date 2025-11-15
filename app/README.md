## CalmMind Agent Scaffold

Minimal TypeScript simulation of the on-device AI agent that processes smartphone wellbeing metrics, computes a migraine risk score, and picks an automatic intervention.

### Getting Started
1. Open a Linux shell (WSL bash) and `cd /home/cutebutzaiko/junction/app`.  
   > Windows `cmd.exe` cannot run the scripts because UNC paths break `tsx`.
2. Install dependencies: `npm install`.
3. Run the agent simulation: `npm run simulate`.
4. Run the chatbot conversation demo: `npm run chatbot`.

Expected output lists each mock day, the risk score, and the automation that would trigger (dim screen, enable DND, hydrate reminder).

### Structure
- `src/agent/riskEngine.ts` – logistic/rule hybrid scoring.
- `src/data/loaders.ts` – loads shared JSON from `/home/cutebutzaiko/junction/data`.
- `src/simulate.ts` – CLI entry point for the agent demo.
- `src/chatbot/chatbot.ts` – conversation helper used by chatbot demo.
- `src/chatbotDemo.ts` – prints proactive conversation script.

### Next Steps
- Swap mock JSON for actual Android Digital Wellbeing readings via a bridge.
- Call this module from React Native background task.
- Push anonymized aggregates to Google Cloud Function for cohort tuning.

