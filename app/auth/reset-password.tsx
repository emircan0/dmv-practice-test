import { Redirect } from "expo-router";
import { AuthScreen } from "../../src/us/AuthScreen";
import { useAccount } from "../../src/us/auth";
export default function Reset() {
  return useAccount((s) => s.session) ? (
    <AuthScreen mode="reset" />
  ) : (
    <Redirect href="/auth/forgot-password" />
  );
}
