# Original app → US feature map

The original implementation in `legacy/` is the design and behavior reference.
The US runtime never imports its Supabase/RevenueCat/ad/OAuth credentials.

| Original feature | US implementation |
| --- | --- |
| Driving-photo login, registration, forgot/reset password, guest access | `app/auth/`, original photo + dark card, validation, US Supabase auth adapter |
| Apple/Google/email sign-in | Prepared in `src/us/auth.ts`, disabled until the corresponding US provider flag is enabled |
| Profile and account deletion | Profile update, prepared authenticated deletion Edge Function; deployment required |
| Dashboard, shortcuts, credit panel | Original card design; credits awarded only by an integrated earned-reward adapter |
| Practice, exams, category tests, daily challenge | State/profile/release-scoped practice and verified exam assembly, daily 5-question session |
| Wrong/favorite review, question sources | Working with published content, free core access |
| AI Hoca | Original assessment/gauge/task pattern and actual local practice analysis; no external model call |
| Statistics and history | Topic accuracy, recent sessions, full answer review and source snapshots |
| Rankings | Restored tab, current/previous month, accuracy/activity, podium and list; scoped US RPC and migration |
| Study notes and signs | `/notes` and Learn use reviewed lessons from the selected release |
| Subscription/paywall/restore | Screens + typed commerce adapter in `src/us/integrations.ts`; no invented store products/prices |
| Settings | Original profile/premium/grouped-row arrangement, preferences, theme, privacy and support navigation |
| Reminders | Local daily reminder with permission checks, persisted time and cancellation |
| Ranking privacy | Nickname, opt-in and avatar preference, private by default |
| Support/contact/privacy/terms | Routes with US URL settings; no reused Turkish legal claims/addresses |

## Integration handoff

1. Apply `supabase/migrations/202610300002_us_accounts_rankings.sql` in the NEW US
   project, after the content migration. It was compiled/executed in a local
   PostgreSQL-compatible test environment; it has not been applied remotely.
2. Enable the Email, Google and Apple providers in the NEW Supabase project.
   Configure Google/Apple client IDs and secrets in the provider dashboards / Supabase,
   never in this repository. Enable each `EXPO_PUBLIC_US_*_AUTH_ENABLED` flag only
   when that provider is ready. Email registration handles confirmation-required
   accounts without claiming the user is signed in.
3. The app uses PKCE with `dmvsmartprep://auth/callback` in a development/production
   build. Add the exact generated redirect including the `next` query variants to
   Supabase's allowed redirects. Verify the final registered scheme/bundle IDs.
   On web use the origin's `/auth/callback` route. OAuth callbacks need a development
   build for a custom scheme; the app explains this in Expo Go.
4. Enable `EXPO_PUBLIC_US_ACCOUNT_SYNC_ENABLED` after the migration. Finished sessions
   sync idempotently; the server recomputes counts from published release answers.
   Rankings include only opt-in nicknames, never emails. Months use UTC boundaries.
   Device histories remain separate for guest and each US account. No Turkish
   history or users are imported. Cross-device download/merge is a future extension;
   current sync uploads retained device attempts for rankings.
5. Deploy `supabase/functions/us-delete-account`, then enable its flag. It verifies
   the request's user and deletes only that user; server credentials never ship to
   the client. Account deletion cascades profiles and synced attempts.
6. Attach US RevenueCat and ads implementations with `integrations.setCommerce()`
   and `integrations.setAds()`. Ads must resolve `earned=true` only on the native
   earned-reward event. No active quiz interruption is introduced. Official store
   products/offering prices are supplied by the adapter.
7. Configure US support/email/legal URLs in `.env.us.example`. Legal drafts have
   not been invented or copied from the Turkish product. Push notification delivery
   is separate from the implemented local study reminder.

Provider sessions and purchases require real configured test accounts / store
sandbox testing. These have not been live-tested with the user's credentials.

Sources: Supabase React Native Auth guide
https://supabase.com/docs/guides/auth/quickstarts/react-native
and Expo OAuth guide
https://docs.expo.dev/guides/authentication/
