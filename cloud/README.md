## Google Cloud Integration Sketch

1. **Data Sync (Device → Cloud Function)**
   - Background task batches anonymized stats (averaged screen time, pickups, pressure deltas) and POSTs to HTTPS endpoint.
   - Payload schema defined in `mock_function.ts`.

2. **Processing**
   - Cloud Function enriches payload with cohort metadata and stores it in Firestore/BigQuery for analytics.
   - Vertex AI (optional) retrains a lightweight regression job each hour and publishes revised weight deltas.

3. **Response**
   - Function returns tuned weights + bias adjustments (see example in `handler`).
   - Device merges weights into local config without blocking user interactions.

4. **Demo Plan**
   - Use `node cloud/mock_function.ts` to show JSON response.
   - In live app, show “Updated via Cloud at HH:MM” badge on automation screen.

