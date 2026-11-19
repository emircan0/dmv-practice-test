import { Alert } from "react-native";
import { router } from "expo-router";
import { usePrep } from "./store";
import { useT } from "./i18n";
import { useMonetization } from "./monetization";
import { usePreferences } from "./preferences";
import {
  EXAM_CREDIT_COST,
  FREE_EXAM_LIMIT,
  MISTAKES_CREDIT_COST,
  TOPIC_CREDIT_COST,
  isTopicFree,
} from "./premiumPolicy";
import type { ContentRelease, Mode } from "./model";

export function useStartStudy(release: ContentRelease | null) {
  const t = useT();

  const launchSession = (mode: Mode, topic?: string, spendCredits = 0) => {
    const s = usePrep.getState();
    if (!release) return;
    if (mode === "exam" && !release.rule && release.profile === "general-first") {
      router.push("/exam-setup");
      return;
    }
    try {
      s.start(release, mode, topic);
      if (spendCredits > 0) {
        const currentCredits = usePreferences.getState().credits;
        usePreferences
          .getState()
          .patch({ credits: Math.max(0, currentCredits - spendCredits) });
      }
      router.push("/quiz/session");
    } catch (e) {
      const error = e instanceof Error ? e.message : "";
      Alert.alert(
        t("contentError"),
        t(
          error === "rules_pending"
            ? "rulesPending"
            : error === "insufficient_content"
              ? "insufficient"
              : error === "no_questions"
                ? "noQuestions"
                : "invalid"
        )
      );
    }
  };

  return (mode: Mode = "practice", topic?: string) => {
    const s = usePrep.getState();
    if (s.active) {
      router.push("/quiz/session");
      return;
    }
    if (!release) {
      Alert.alert(t("pending"), t("pendingBody"));
      return;
    }

    const isPremium = useMonetization.getState().active;
    const credits = usePreferences.getState().credits;

    // 1. Check PRO Topic Gate (3 core topics are free; 7 advanced topics are PRO or 1 credit)
    if (!isPremium && mode === "practice" && topic && !isTopicFree(topic)) {
      const buttons: {
        text: string;
        style?: "cancel" | "default" | "destructive";
        onPress?: () => void;
      }[] = [{ text: t("cancel"), style: "cancel" }];

      if (credits >= TOPIC_CREDIT_COST) {
        buttons.push({
          text: `Use ${TOPIC_CREDIT_COST} Credit (${credits} left)`,
          onPress: () => launchSession(mode, topic, TOPIC_CREDIT_COST),
        });
      }
      buttons.push({
        text: "Unlock Full Access ($6.99)",
        onPress: () => router.push("/premium"),
      });

      Alert.alert(
        "Full Access Topic",
        `Unlock all 10 handbook topics and unlimited exam simulators with Full Access ($6.99 one-time), or use ${TOPIC_CREDIT_COST} Credit (${credits} available) for this session.`,
        buttons
      );
      return;
    }

    // 2. Check Full Exam Simulator Gate (1st full exam is free; unlimited with PRO or 2 credits)
    if (!isPremium && mode === "exam") {
      const completedExams = s.attempts.filter((a) => a.mode === "exam").length;
      if (completedExams >= FREE_EXAM_LIMIT) {
        const buttons: {
          text: string;
          style?: "cancel" | "default" | "destructive";
          onPress?: () => void;
        }[] = [{ text: t("cancel"), style: "cancel" }];

        if (credits >= EXAM_CREDIT_COST) {
          buttons.push({
            text: `Use ${EXAM_CREDIT_COST} Credits (${credits} left)`,
            onPress: () => launchSession(mode, topic, EXAM_CREDIT_COST),
          });
        }
        buttons.push({
          text: "Unlock Full Access ($6.99)",
          onPress: () => router.push("/premium"),
        });

        Alert.alert(
          "Free Exam Trial Completed",
          `You've completed your free exam simulator trial. Unlock Full Access ($6.99 one-time) for unlimited exams, or use ${EXAM_CREDIT_COST} Credits (${credits} available) for one exam.`,
          buttons
        );
        return;
      }
    }

    // 3. Check Mistake Review Gate (Unlimited with PRO or 1 credit if user has mistakes)
    if (!isPremium && mode === "mistakes") {
      const hasMistakes = s.attempts.some(
        (a) => a.state === release.state && a.result.wrong > 0
      );
      if (hasMistakes) {
        const buttons: {
          text: string;
          style?: "cancel" | "default" | "destructive";
          onPress?: () => void;
        }[] = [{ text: t("cancel"), style: "cancel" }];

        if (credits >= MISTAKES_CREDIT_COST) {
          buttons.push({
            text: `Use ${MISTAKES_CREDIT_COST} Credit (${credits} left)`,
            onPress: () => launchSession(mode, topic, MISTAKES_CREDIT_COST),
          });
        }
        buttons.push({
          text: "Unlock Full Access ($6.99)",
          onPress: () => router.push("/premium"),
        });

        Alert.alert(
          "Mistake Review",
          `Unlock unlimited Mistake Review sessions with Full Access ($6.99), or use ${MISTAKES_CREDIT_COST} Credit (${credits} available) to review your mistakes now.`,
          buttons
        );
        return;
      }
    }

    launchSession(mode, topic, 0);
  };
}
