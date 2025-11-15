const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();

exports.calmmindTuning = async (req, res) => {
  try {
    const payload = {
      cohortId: req.body?.cohortId ?? "balanced",
      avgScreenMinutes: Number(req.body?.avgScreenMinutes ?? 300),
      avgLongestSession: Number(req.body?.avgLongestSession ?? 90),
      avgPressureDrop: Number(req.body?.avgPressureDrop ?? 5)
    };

    const adjustments = {
      screenMinutes:
        payload.avgScreenMinutes > 360 ? 0.4 : payload.avgScreenMinutes > 300 ? 0.35 : 0.3,
      longestSessionMinutes:
        payload.avgLongestSession > 120 ? 0.25 : 0.2,
      pressureDrop:
        payload.avgPressureDrop > 8 ? 0.2 : 0.15
    };

    const response = {
      cohortId: payload.cohortId,
      updated: new Date().toISOString(),
      weights: adjustments,
      biasDelta: payload.avgScreenMinutes > 400 ? 0.05 : 0,
      contextNote: "",
      cohortStats: null
    };

    const stats = await recordCohortInsight(payload, response);
    response.cohortStats = stats;
    response.contextNote = buildContextNote(payload.cohortId, stats);

    res.status(200).json(response);
  } catch (err) {
    console.error("calmmindTuning error", err);
    res.status(500).json({ error: "internal_error" });
  }
};

const recordCohortInsight = async (payload, response) => {
  const insightsRef = firestore.collection("cohortInsights");
  await insightsRef.add({
    payload,
    response,
    receivedAt: Firestore.Timestamp.now()
  });

  const statsRef = firestore.collection("cohortStats").doc(payload.cohortId);

  const stats = await firestore.runTransaction(async (tx) => {
    const snapshot = await tx.get(statsRef);
    const data = snapshot.exists
      ? snapshot.data()
      : {
          count: 0,
          avgScreenMinutes: 0,
          avgPressureDrop: 0,
          avgLongestSession: 0
        };

    const nextCount = data.count + 1;
    const avgScreen =
      (data.avgScreenMinutes * data.count + payload.avgScreenMinutes) / nextCount;
    const avgPressure =
      (data.avgPressureDrop * data.count + payload.avgPressureDrop) / nextCount;
    const avgSession =
      (data.avgLongestSession * data.count + payload.avgLongestSession) / nextCount;

    const nextStats = {
      count: nextCount,
      avgScreenMinutes: Number(avgScreen.toFixed(2)),
      avgPressureDrop: Number(avgPressure.toFixed(2)),
      avgLongestSession: Number(avgSession.toFixed(2))
    };

    tx.set(statsRef, nextStats, { merge: true });
    return nextStats;
  });

  return stats;
};

const buildContextNote = (cohortId, stats) => {
  if (!stats) {
    return "Cloud tuning ready when data comes in.";
  }
  const trigger =
    stats.avgScreenMinutes > 360
      ? "late-night screen spikes"
      : stats.avgPressureDrop > 8
        ? "pressure swings"
        : "balanced usage";

  return `Cloud spotted ${trigger} across ${stats.count} samples in ${cohortId}.`;
};

