/**
 * Sample Google Cloud Function (HTTP) that ingests anonymized wellbeing stats
 * and returns tuned weights for the on-device agent.
 */
export type CohortPayload = {
  cohortId: string;
  avgScreenMinutes: number;
  avgLongestSession: number;
  avgPressureDrop: number;
};

export const handler = (payload: CohortPayload) => {
  const adjustments = {
    screenMinutes:
      payload.avgScreenMinutes > 360 ? 0.4 : payload.avgScreenMinutes > 300 ? 0.35 : 0.3,
    longestSessionMinutes:
      payload.avgLongestSession > 120 ? 0.25 : 0.2,
    pressureDrop:
      payload.avgPressureDrop > 8 ? 0.2 : 0.15
  };

  return {
    cohortId: payload.cohortId,
    updated: new Date().toISOString(),
    weights: adjustments,
    biasDelta: payload.avgScreenMinutes > 400 ? 0.05 : 0
  };
};

// Example invocation for local testing
if (process.argv[1] === new URL(import.meta.url).pathname) {
  console.log(
    handler({
      cohortId: "evening-owls",
      avgScreenMinutes: 410,
      avgLongestSession: 135,
      avgPressureDrop: 9
    })
  );
}

