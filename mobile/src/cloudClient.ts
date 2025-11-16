import { RiskInsight, WellbeingDay } from "../../app/src/types";

export type CloudTuningPayload = {
  cohortId: string;
  avgScreenMinutes: number;
  avgLongestSession: number;
  avgPressureDrop: number;
};

export type CloudTuningResponse = {
  cohortId: string;
  updated: string;
  weights: Partial<Record<keyof RiskInsight | string, number>>;
  biasDelta: number;
  contextNote: string;
  cohortStats?: {
    count: number;
    avgScreenMinutes: number;
    avgLongestSession: number;
    avgPressureDrop: number;
  } | null;
};

const pickCohort = (day: WellbeingDay): string => {
  if (day.screenMinutes > 360) return "night-owls";
  if (day.stressMeetings >= 5) return "meeting-heavy";
  return "balanced";
};

export const buildPayload = (
  day: WellbeingDay,
  pressureDrop: number
): CloudTuningPayload => ({
  cohortId: pickCohort(day),
  avgScreenMinutes: day.screenMinutes,
  avgLongestSession: day.longestSessionMinutes,
  avgPressureDrop: pressureDrop
});

const CLOUD_TUNING_URL =
  process.env.EXPO_PUBLIC_TUNING_URL ??
  "https://us-central1-calmind-478309.cloudfunctions.net/calmmindTuning";

export const requestCloudTuning = async (
  payload: CloudTuningPayload
): Promise<CloudTuningResponse> => {
  try {
    const response = await fetch(CLOUD_TUNING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Cloud returned ${response.status}`);
    }

    return (await response.json()) as CloudTuningResponse;
  } catch (error) {
    console.warn("Cloud tuning failed, falling back to local mock", error);
    return {
      cohortId: payload.cohortId,
      updated: new Date().toISOString(),
      weights: {
        screenMinutes: payload.avgScreenMinutes > 360 ? 0.38 : 0.3,
        pressureDrop: payload.avgPressureDrop > 8 ? 0.2 : 0.15
      },
      biasDelta: payload.avgScreenMinutes > 400 ? 0.07 : 0,
      contextNote: "Offline mode: using local tuning estimates.",
      cohortStats: null
    };
  }
};

