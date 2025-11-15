import React, { useEffect, useMemo, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView
} from "react-native";
import { RiskEngine } from "../app/src/agent/riskEngine";
import {
  RiskConfig,
  RiskInsight,
  WeatherDay,
  WellbeingDay
} from "../app/src/types";
import {
  buildPayload,
  CloudTuningResponse,
  requestCloudTuning
} from "./src/cloudClient";
import { buildWeeklySummary, WeeklySummary } from "./src/weeklySummary";

import wellbeingJson from "../data/mock_wellbeing.json";
import weatherJson from "../data/mock_weather.json";
import configJson from "../data/risk_thresholds.json";

const wellbeingDays = wellbeingJson.days as WellbeingDay[];
const weatherDays = weatherJson.days as WeatherDay[];
const riskConfig = configJson as RiskConfig;

const useRiskEngine = () => {
  return useMemo(() => new RiskEngine(riskConfig, weatherDays), []);
};

export default function App() {
  const engine = useRiskEngine();
  const [index, setIndex] = useState(wellbeingDays.length - 1);
  const [toast, setToast] = useState<string | null>(null);
  const [previousVisited, setPreviousVisited] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<CloudTuningResponse | null>(null);
  const [cloudLoading, setCloudLoading] = useState(false);

  const insight = useMemo(
    () => engine.evaluateDay(wellbeingDays[index]),
    [engine, index]
  );

  const weeklySummary = useMemo<WeeklySummary>(
    () => buildWeeklySummary(wellbeingDays, weatherDays, engine, riskConfig),
    []
  );

  useEffect(() => {
    if (index !== wellbeingDays.length - 1) {
      return;
    }
    const day = wellbeingDays[index];
    const weather = weatherDays.find((w) => w.date === day.date);
    const pressureDrop = weather
      ? Math.max(0, weatherDays[0].pressureHpa - weather.pressureHpa)
      : 0;
    setCloudLoading(true);
    requestCloudTuning(buildPayload(day, pressureDrop))
      .then((data) => setCloudStatus(data))
      .finally(() => setCloudLoading(false));
  }, [index]);

  const goPrevious = () =>
    setIndex((prev) => {
      if (prev === 0) {
        setPreviousVisited(true);
        return prev;
      }
      setPreviousVisited(true);
      return prev - 1;
    });

  const goNext = () =>
    setIndex((prev) => {
      if (!previousVisited || prev === wellbeingDays.length - 1) {
        setPreviousVisited(false);
        return prev;
      }
      const nextIndex = prev + 1;
      const reachedToday = nextIndex >= wellbeingDays.length - 1;
      if (reachedToday) {
        setPreviousVisited(false);
        return wellbeingDays.length - 1;
      }
      return nextIndex;
    });

  const handleDecision = (type: "do" | "snooze") => {
    setToast(
      type === "do"
        ? "Automation confirmed – CalmMind is handling it."
        : "Snoozed for 30 minutes. I’ll stay quiet meanwhile."
    );
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>CalmMind Sneak Peek</Text>
        <Text style={styles.subtitle}>
          Passive agent + proactive nudge preview ({insight.date})
        </Text>
        <RiskScore insight={insight} />
        <DriverList insight={insight} />
        <NotificationCard insight={insight} onDecision={handleDecision} />
        <AutomationCard insight={insight} />
        <CloudTuningCard status={cloudStatus} loading={cloudLoading} />
        <WeeklyRecapCard summary={weeklySummary} />
        {toast && <Text style={styles.toast}>{toast}</Text>}
        <View style={styles.navRow}>
          <Pressable
            style={[
              styles.button,
              index === 0 && styles.buttonDisabled
            ]}
            onPress={goPrevious}
            disabled={index === 0}
          >
            <Text style={styles.buttonLabel}>Previous day</Text>
          </Pressable>
          <Pressable
            style={[
              styles.button,
              !previousVisited && styles.buttonDisabled
            ]}
            onPress={goNext}
            disabled={!previousVisited}
          >
            <Text style={styles.buttonLabel}>Next day</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const RiskScore = ({ insight }: { insight: RiskInsight }) => {
  const status =
    insight.score >= riskConfig.riskThreshold ? "High risk" : "Stable";
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{status}</Text>
      <Text style={styles.score}>{insight.score.toFixed(2)}</Text>
      <Text style={styles.cardBody}>
        Threshold {riskConfig.riskThreshold.toFixed(2)} · AI agent only nudges
        when confidence is high.
      </Text>
    </View>
  );
};

const DriverList = ({ insight }: { insight: RiskInsight }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Today's context</Text>
    {insight.drivers.map((driver) => (
      <Text key={driver} style={styles.listItem}>
        • {driver}
      </Text>
    ))}
    {insight.drivers.length === 0 && (
      <Text style={styles.cardBody}>All metrics within baseline.</Text>
    )}
  </View>
);

const CloudTuningCard = ({
  status,
  loading
}: {
  status: CloudTuningResponse | null;
  loading: boolean;
}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Google Cloud assist</Text>
    {loading && <Text style={styles.cardBody}>Syncing cohort tuning…</Text>}
    {!loading && status && (
      <>
        <Text style={styles.cardBody}>
          {status.contextNote} ({status.cohortId})
        </Text>
        {status.cohortStats && (
          <Text style={styles.helper}>
            {status.cohortStats.count} samples · avg screen{" "}
            {status.cohortStats.avgScreenMinutes}m · avg pressure drop{" "}
            {status.cohortStats.avgPressureDrop} hPa
          </Text>
        )}
        <Text style={styles.helper}>
          Updated {new Date(status.updated).toLocaleTimeString()} · bias +
          {status.biasDelta.toFixed(2)}
        </Text>
      </>
    )}
    {!loading && !status && (
      <Text style={styles.cardBody}>Cloud tuning available when you reach today.</Text>
    )}
  </View>
);

const WeeklyRecapCard = ({ summary }: { summary: WeeklySummary }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Weekly story</Text>
    <Text style={styles.cardBody}>{summary.recap}</Text>
    <View style={styles.recapRow}>
      <View>
        <Text style={styles.recapMetric}>{summary.migrainesPrevented}</Text>
        <Text style={styles.helper}>nudges</Text>
      </View>
      <View>
        <Text style={styles.recapMetric}>{summary.strongestDriver}</Text>
        <Text style={styles.helper}>top trigger</Text>
      </View>
      <View>
        <Text style={styles.recapMetric}>{summary.favoriteAutomation}</Text>
        <Text style={styles.helper}>hero automation</Text>
      </View>
    </View>
  </View>
);

const NotificationCard = ({
  insight,
  onDecision
}: {
  insight: RiskInsight;
  onDecision: (type: "do" | "snooze") => void;
}) => (
  <View style={styles.notification}>
    <Text style={styles.notificationTitle}>CalmMind recommends a reset</Text>
    <Text style={styles.notificationBody}>{insight.recommendation}</Text>
    <View style={styles.notificationActions}>
      <Pressable style={styles.cta} onPress={() => onDecision("do")}>
        <Text style={styles.ctaLabel}>Do it</Text>
      </Pressable>
      <Pressable
        style={[styles.cta, styles.ctaGhost]}
        onPress={() => onDecision("snooze")}
      >
        <Text style={[styles.ctaLabel, styles.ctaGhostLabel]}>Snooze</Text>
      </Pressable>
    </View>
  </View>
);

const ACTION_COPY: Record<RiskInsight["action"], string> = {
  dim_screen: "Screen brightness + blue light filter auto-adjusted.",
  enable_dnd: "Do Not Disturb + bedtime focus enabled for 45 minutes.",
  hydrate_reminder: "Hydration timer started; you’ll get a gentle ping soon."
};

const AutomationCard = ({ insight }: { insight: RiskInsight }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Automation in effect</Text>
    <Text style={styles.cardBody}>{ACTION_COPY[insight.action]}</Text>
    <Text style={styles.helper}>Tap to edit automation (mock)</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#05060b"
  },
  container: {
    padding: 24,
    gap: 16
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8f9ff"
  },
  subtitle: {
    color: "#c4c8ff",
    marginBottom: 8
  },
  card: {
    backgroundColor: "#151826",
    borderRadius: 16,
    padding: 20,
    gap: 8
  },
  cardTitle: {
    color: "#f3f4ff",
    fontSize: 16,
    fontWeight: "600"
  },
  cardBody: {
    color: "#d3d6f7",
    fontSize: 14
  },
  listItem: {
    color: "#d3d6f7",
    fontSize: 14
  },
  score: {
    fontSize: 48,
    fontWeight: "700",
    color: "#86ffdd"
  },
  notification: {
    backgroundColor: "#1f2233",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5
  },
  notificationTitle: {
    color: "#f8f9ff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6
  },
  notificationBody: {
    color: "#d5d9ff",
    marginBottom: 12
  },
  notificationActions: {
    flexDirection: "row",
    gap: 12
  },
  cta: {
    backgroundColor: "#6c5ce7",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 999
  },
  ctaLabel: {
    color: "#fff",
    fontWeight: "600"
  },
  ctaGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#6c5ce7"
  },
  ctaGhostLabel: {
    color: "#6c5ce7"
  },
  button: {
    backgroundColor: "#2f3246",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    flex: 1
  },
  buttonDisabled: {
    opacity: 0.4
  },
  buttonLabel: {
    color: "#f3f4ff",
    fontWeight: "600"
  },
  helper: {
    color: "#8a8fb6",
    fontSize: 12
  },
  recapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12
  },
  recapMetric: {
    color: "#f8f9ff",
    fontWeight: "600"
  },
  toast: {
    color: "#86ffdd",
    textAlign: "center",
    marginTop: 8
  },
  navRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4
  }
});

