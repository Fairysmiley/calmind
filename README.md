## CalmMind – Passive Migraine Shield

CalmMind is a hands-off migraine companion built for Junction. The on-device agent monitors smartphone wellbeing signals (screen time, pickups, DND usage, weather) and quietly triggers preventative automations. A live Google Cloud loop aggregates anonymized cohorts to keep the agent smart without extra user interaction.

### Repository Layout
- `app/`: TypeScript risk engine + CLI simulations.
- `mobile/`: Expo/React Native prototype that visualizes the agent, Migraine Shield, voice commands, cloud badge, and weekly recap.
- `cloud/`: Google Cloud Function (`calmmindTuning`) that stores cohort stats in Firestore and returns tuning adjustments.
- `data/`: Mock Digital Wellbeing + weather samples for offline demos.
- `figma/`, `demo/`: Flow notes and pitch script.

### Prerequisites
- Node.js 18+ inside WSL/Linux (for both `app/` and `mobile/`).
- Expo CLI (`npx expo`).
- Google Cloud SDK authenticated to project `calmind-478309`.
- Firestore database already created (`gcloud firestore databases create --location=us-central1`).

### Quick Start – Agent Simulation
```bash
cd /home/cutebutzaiko/junction/app
npm install        # only needed once
npm run simulate   # prints risk scores + automations
npm run chatbot    # shows proactive chat example
```

### Quick Start – Expo Prototype
```bash
cd /home/cutebutzaiko/junction/mobile
npm install        # first time
npx expo start     # or `npx expo start --tunnel`
```
Scan the QR code with Expo Go or open an emulator. Use the “Previous day / Next day” buttons to replay scenarios. High-risk days auto-enable the Migraine Shield card. Voice buttons (“status / explain / silence”) simulate hands-free responses. The “Google Cloud assist” card should fetch live data from the deployed Cloud Function and show cohort stats.

> If Expo Go cannot download the bundle on LAN, use tunnel mode (`npx expo start --tunnel`) or ensure port 8081 is open in Windows Firewall.

### Deploying / Updating the Cloud Function
```bash
cd /home/cutebutzaiko/junction/cloud
gcloud functions deploy calmmindTuning \
  --runtime=nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --region=us-central1 \
  --entry-point=calmmindTuning \
  --project=calmind-478309
```
Each invocation logs payloads to Firestore collections `cohortInsights` and `cohortStats`. The mobile app reads the HTTPS endpoint at `https://us-central1-calmind-478309.cloudfunctions.net/calmmindTuning`.

### Demo Checklist
1. Run the Expo app and show:
   - Passive risk cards
   - Migraine Shield auto-activation
   - Voice command simulation
   - Google Cloud badge updating with timestamp + cohort stats
   - Weekly recap narrative
2. Run `npm run simulate` (agent CLI) for transparency.
3. Highlight Firestore console with live `cohortInsights`.
4. Play Figma prototype (chatbot onboarding, automation approvals).
5. Keep backup recordings (see `demo/script.md`) in case of network issues.

### Troubleshooting
- **Expo Go “failed to download update”**: switch to tunnel mode (`npx expo start --tunnel`) or ensure device and WSL share the same network and firewall allows port 8081.
- **Cloud Function errors**: confirm Firestore API is enabled and database exists; check Logs Explorer for `calmmindtuning`.
- **npm install fails on Windows**: run inside WSL, and if UNC errors persist, set `npm config set script-shell /bin/bash`.

CalmMind’s differentiator is the zero-interaction Migraine Shield + live cloud cohort intelligence. Build your pitch around “the phone fixes itself before a migraine hits.” Good luck at Junction!

