import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface Preferences {
  credits: number;
  theme: "system" | "light" | "dark";
  notifications: boolean;
  reminder: boolean;
  reminderTime: string;
  analytics: boolean;
  showRanking: boolean;
  hideAvatar: boolean;
  nickname: string;
  patch: (value: Partial<Omit<Preferences, "patch">>) => void;
}
export const usePreferences = create<Preferences>()(
  persist(
    (set) => ({
      credits: 0,
      theme: "system",
      notifications: false,
      reminder: false,
      reminderTime: "20:00",
      analytics: false,
      showRanking: false,
      hideAvatar: true,
      nickname: "",
      patch: (value) => set(value),
    }),
    {
      name: "dmv-smart-prep:preferences:v1",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
