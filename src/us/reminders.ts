import { usePreferences } from "./preferences";
import { en } from "./i18n";
export async function setReminder(
  enabled: boolean,
  time: string,
  title: string,
  body: string,
) {
  const Notifications = await import("expo-notifications");
  const old = await Notifications.getAllScheduledNotificationsAsync();
  if (!enabled) {
    await Promise.all(
      old
        .filter((n) => n.content.data?.kind === "us-study")
        .map((n) =>
          Notifications.cancelScheduledNotificationAsync(n.identifier),
        ),
    );
    usePreferences.getState().patch({ reminder: false });
    return;
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error("reminderTime");
  const permission = await Notifications.requestPermissionsAsync();
  if (permission.status !== "granted") throw new Error("unavailable");
  const [hour, minute] = time.split(":").map(Number);
  // Create the replacement first so a scheduling failure does not delete a working reminder.
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: { kind: "us-study" } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  await Promise.all(
    old
      .filter((n) => n.content.data?.kind === "us-study")
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  usePreferences
    .getState()
    .patch({ notifications: true, reminder: true, reminderTime: time });
}
