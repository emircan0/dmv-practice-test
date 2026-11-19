import { Redirect } from "expo-router";
import { usePrep } from "../src/us/store";
import { useAccount } from "../src/us/auth";
export default function Index() {
  const onboarded = usePrep((s) => s.onboarded),
    account = useAccount();
  return (
    <Redirect
      href={
        !onboarded && !account.entered && !account.session
          ? "/auth/login"
          : onboarded
            ? "/(tabs)"
            : "/onboarding"
      }
    />
  );
}
