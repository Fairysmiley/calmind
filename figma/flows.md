## CalmMind Figma Flow Notes

### 1. Onboarding & Consent
1. Splash: CalmMind logo + punchline “Your phone’s quiet nudge before migraine chaos hits.”
2. Consent screen:
   - Bullet list of data signals used (screen time, pickups, notifications, bedtime mode).
   - Toggle to pre-approve automation actions (dim screen, enable DND, send hydration reminder).
   - CTA “Stay Protected” → background agent activates.
3. Micro tutorial carousel (3 cards max):
   - “Passive sensing” (all automatic).
   - “Smart nudge” example.
   - “Chatbot explains why.”

### 2. Passive Monitoring Home (Hands-off)
- Hero card showing “Status: Monitoring quietly.”
- Minimal UI with last nudge timestamp and upcoming automation (if any).
- Button “Peek at insights” leading to chatbot summary, but not required for normal use.

### 3. Proactive Nudge Notification
- System notification mock:
  - Title: “CalmMind recommends a reset.”
  - Body: “4h intense screen time + skipped bedtime mode. Tap to dim display & hydrate.”
- Tapping opens “Quick Action” sheet with one-tap confirm or snooze.

### 4. Chatbot Conversation
- Chat bubble layout, single column.
- Sample exchanges:
  - Bot: “I noticed continuous screen exposure since 10pm. Want me to auto-dim after 45 min at night?”
  - User quick replies: “Yes, do it” / “Remind me later” / “What triggered this?”
  - Bot explanation card referencing data and confidence score.
- “Trigger Detective” optional question for user input.

### 5. Automation Control Screen
- List of automations (Dim screen, DND, Hydrate reminder).
- Toggle switches, each with “Last triggered” timestamp and edit button.
- CTA to add custom automation (future scope, greyed out).

### 6. Insights Recap
- Timeline component showing last 3 nudges with icons.
- Risk gauge (low/med/high) derived from local model.
- Link “View Cloud insights” (placeholder) referencing Google Cloud analytics integration.

### Prototype Notes
- Use Smart Animate between notification → chatbot → automation sheet to show minimal interaction.
- Color palette: soothing blues/purples; maintain accessibility contrast.
- Provide recorded walkthrough (30–45s) for demo deck.

