import { RiskInsight } from "../types";

export type ChatTurn = {
  sender: "agent" | "user";
  text: string;
  quickReplies?: string[];
};

const ACTION_COPY: Record<string, string> = {
  dim_screen: "I've dimmed the screen to ease eye strain.",
  enable_dnd: "I activated DND + bedtime focus for 45 minutes.",
  hydrate_reminder: "Timer set. I’ll ping you in 5 minutes to sip water."
};

export const generateProactiveTurns = (
  insight: RiskInsight
): ChatTurn[] => [
  {
    sender: "agent",
    text: `Heads-up! ${insight.recommendation}`
  },
  {
    sender: "agent",
    text: ACTION_COPY[insight.action],
    quickReplies: ["Thanks", "Skip next time", "Why now?"]
  }
];

export const handleUserReply = (reply: string, insight: RiskInsight): ChatTurn => {
  if (/why/i.test(reply)) {
    return {
      sender: "agent",
      text: `Drivers earlier today: ${insight.drivers.join(
        ", "
      )}. I’ll keep monitoring quietly.`
    };
  }

  if (/skip/i.test(reply)) {
    return {
      sender: "agent",
      text:
        "Understood. I’ll dial back sensitivity for the next 2 hours. Ping me if you change your mind."
    };
  }

  return {
    sender: "agent",
    text: "Glad to help. I’ll stay silent unless another high-confidence risk appears."
  };
};

