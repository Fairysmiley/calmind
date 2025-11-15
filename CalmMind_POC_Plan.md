## CalmMind Migraine Guard – 1-Day Build Plan

### Objectives
- Deliver a demo-ready MVP showing passive sensing → AI risk inference → proactive nudge with minimal user interaction.
- Showcase Figma prototype, lightweight mobile shell, and optional Google Cloud enhancement.
- Keep scope limited to smartphone-only signals (Digital Wellbeing, screen/notification metrics, context data) with mocked feeds where APIs are inaccessible in 12h.

### Assumptions
- Android device with Digital Wellbeing stats available (or mock JSON).
- User consents once; background services stay active afterward.
- Local “agent” runs simple rule-based + logistic regression hybrid; no heavy training required live.
- Google Cloud access optional; if unavailable, Cloud calls are mocked.

### Data Signals (Phase 1)
1. Screen-on cadence & total daily duration.
2. Phone pickups/unlocks count.
3. Notification volume + DND toggles.
4. Bedtime mode adherence (sleep proxy).
5. Optional: ambient brightness, location-based weather delta (mock).

### MVP Flow
1. Background collector ingests data (mock JSON rotating through “calm” vs “risk” days).
2. Agent computes risk score:
   - Weighted rule thresholds (e.g., >3h continuous screen, >60 pickups).
   - Simple logistic regression stub for extensibility.
3. When risk ≥ 0.75, trigger:
   - Passive: Dim screen / enable DND automatically (pre-approved).
   - Active: Send concise notification + chatbot entry “Quick reset?”
4. Chatbot view (mobile screen or web panel) explains reason and offers actions.
5. Optional Cloud sync posts anonymized stats to Cloud Function → Vertex AI stub returns updated coefficients.

### Work Breakdown & Deliverables
| Phase | Goal | Output |
| --- | --- | --- |
| 1. Spec & artifacts | Finalize narrative, signals, models | This document + data schemas |
| 2. Figma UX | Flows for onboarding, silent monitoring, chatbot, automation screen | `figma/CalmMind.fig` (export link) + PNGs |
| 3. Mobile/Agent scaffold | React Native or Kotlin demo app with mocked data | Repo folder `app/` with screens + risk logic |
| 4. Chatbot + Cloud hook | UI component + optional GCP endpoint (or mock) | Chat view + `cloud/mock_function.js` |
| 5. Demo assets | Script + backup video plan | `demo/Script.md`, screen recording stub |

### Data & Mock Files
- `data/mock_wellbeing.json`: rotating 24h stats.
- `data/mock_weather.json`: pressure & humidity swings.
- `data/risk_thresholds.json`: editable weights.

### Technical Stack Choices
- **Mobile shell**: React Native (Expo) for speed; can present on Android emulator.
- **Agent logic**: TypeScript module using deterministic rules + logistic function.
- **Chatbot**: React Native view or lightweight web dashboard (Next.js) hitting local mock API.
- **Cloud optional**: Node.js Cloud Function (or Express mock) simulating Vertex AI response.

### Risks & Mitigations
- Digital Wellbeing permissions → use static mocks + video capture.
- Time crunch for app setup → keep RN screens minimal, focus on background job simulation.
- Cloud latency/demo failure → log responses locally, provide recorded fallback.

### Next Immediate Tasks
1. Create mock data files + risk logic interface.
2. Start Figma flows while scaffolding RN project.
3. Implement notification + automation toggle demonstration.
4. Wire chatbot conversation tying to latest risk event.

