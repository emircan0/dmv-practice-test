import * as Apple from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { client } from "./backend";
import { activateStudyScope } from "./studyScope";
import { useAccount } from "./auth";
export async function nativeAppleSignIn(): Promise<boolean> {
  if (!client) throw new Error("authSetup");
  if (!(await Apple.isAvailableAsync())) throw new Error("unavailable");
  const nonce = Crypto.randomUUID(),
    state = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    nonce,
  );
  let credential: Apple.AppleAuthenticationCredential;
  try {
    credential = await Apple.signInAsync({
      requestedScopes: [
        Apple.AppleAuthenticationScope.FULL_NAME,
        Apple.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
      state,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === "ERR_REQUEST_CANCELED"
    )
      return false;
    throw new Error("authFailed");
  }
  if (!credential.identityToken || credential.state !== state)
    throw new Error("authFailed");
  const { data, error } = await client.auth.signInWithIdToken({
    provider: "apple",
    token: credential.identityToken,
    nonce,
  });
  if (error || !data.session) throw new Error("authFailed");
  // Apple shares names only on the initial consent. Keep existing metadata otherwise.
  const fullName = [
    credential.fullName?.givenName,
    credential.fullName?.familyName,
  ]
    .filter(Boolean)
    .join(" ");
  if (fullName) {
    await client.auth.updateUser({ data: { full_name: fullName } });
  }
  await activateStudyScope(data.session.user.id);
  useAccount.setState({ session: data.session });
  return true;
}

// Reauthentication supplies a fresh one-use code for server-side token revocation.
export async function appleDeletionCode(): Promise<string | undefined> {
  if (!(await Apple.isAvailableAsync())) return undefined;
  try {
    const credential = await Apple.signInAsync({ requestedScopes: [] });
    return credential.authorizationCode || undefined;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ERR_REQUEST_CANCELED")
      throw new Error("cancelled");
    return undefined;
  }
}
