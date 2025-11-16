export type WellbeingDay = {
  date: string;
  screenMinutes: number;
  longestSessionMinutes: number;
  pickups: number;
  notifications: number;
  bedtimeModeUsed: boolean;
  dndMinutes: number;
  stressMeetings: number;
};

export type WeatherDay = {
  date: string;
  pressureHpa: number;
  humidity: number;
  stormAlert: boolean;
};

export type RiskConfig = {
  weights: Record<string, number>;
  bias: number;
  riskThreshold: number;
};

export type RiskInsight = {
  date: string;
  score: number;
  drivers: string[];
  recommendation: string;
  action: "dim_screen" | "enable_dnd" | "hydrate_reminder";
};

