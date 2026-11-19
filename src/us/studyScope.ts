import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePreferences } from "./preferences";
import { usePrep } from "./store";
let queue = Promise.resolve();
// Keep each US account's on-device answers separate, preserving guest history.
export function activateStudyScope(owner: string) {
  queue = queue
    .catch(() => {})
    .then(async () => {
      const current = usePrep.getState();
      if (current.studyOwner === owner) return;
      const snapshot = {
        attempts: current.attempts,
        favorites: current.favorites,
        active: current.active,
        tools: current.tools,
        rankingPrefs: ((p) => ({
          nickname: p.nickname,
          showRanking: p.showRanking,
          hideAvatar: p.hideAvatar,
          credits: p.credits,
        }))(usePreferences.getState()),
      };
      await AsyncStorage.setItem(
        "dmv-us-study:" + current.studyOwner,
        JSON.stringify(snapshot),
      );
      usePreferences.getState().patch({
        nickname: "",
        showRanking: false,
        hideAvatar: true,
        credits: 0,
      });
      usePrep.setState({
        attempts: [],
        tools: [],
        favorites: [],
        active: null,
        studyOwner: owner,
      });
      const raw = await AsyncStorage.getItem("dmv-us-study:" + owner);
      let restored = { attempts: [], favorites: [], active: null, tools: [] };
      if (raw) {
        try {
          const value = JSON.parse(raw);
          if (Array.isArray(value.attempts) && Array.isArray(value.favorites))
            restored = value;
          if (value.rankingPrefs)
            usePreferences.getState().patch(value.rankingPrefs);
        } catch {}
      }
      usePrep.setState({ ...restored, studyOwner: owner });
    });
  return queue;
}
