# US conversion — foundation status

30 October 2026. This records implementation; the original planning document is
preserved. No production service was written to or migrated.

## iOS release integrations — 6 November 2026

RevenueCat 10.16.0 and AdMob 17.4.0 SDKs are installed. Runtime initialization is
native-only and gated by separate US flags/keys. The paywall supports an explicit
monthly subscription + lifetime non-consumable allowlist, localized store prices,
restore, customer entitlement updates and account identity changes. Premium removes
automatic ads and includes unlimited personal plans/reports. New 7-day plans and
detailed progress snapshots cost 3 local study credits otherwise; reopening saved
snapshots is free. Generation needs 10 answers/5 unique questions and uses real
state-scoped history. Artifacts and credits are isolated with device account scope.

AdMob gathers UMP consent before SDK initialization/ad requests, uses non-personalized
requests and a G content rating, rewards only from the earned event, and limits
interstitials to exits from completed practice sessions (three distinct sessions,
two-minute spacing; no exams/daily interruptions). Privacy choices are in settings.
The authenticated deletion function now verifies/revokes a fresh Apple authorization
when possible, still fulfills deletion if revocation is unavailable and explains
manual Apple grant removal. Result questions can open a support-email draft with
question/release/source metadata; no email is sent automatically.

The iOS simulator development-client native build completed with the new SDKs.
The App Store production archive, real device/sandbox transactions, live ad consent,
provider sign-ins and remote function deployment are not verified. Read-only live
provider checks show Apple/email enabled and Google disabled. Complete reviewed
first-group content was not verified. See `us-app-store-release-plan.md` and
`npm run release:check:ios -- --online` for current prerequisites. No store submission,
production ad request, purchase, remote schema migration or content publication
was performed by this revision.

## Dashboard visual revision — live app references

The home screen follows the provided live app screenshots: fixed welcome/name
header with streak and notification shortcuts; credit card; pink Premium banner;
peach daily challenge; side-by-side blue quick practice and pink mistakes cards;
exam card; four shortcuts; live leaderboard preview; purple coach banner; and a
two-column category grid. Navigation keeps six tabs, with Exams and Statistics
labels matching the reference. Both interface languages and dark mode are retained.
Quick practice now draws up to 10 questions; daily practice draws up to 5.
Categories use actual topics from the published state package. Empty packages show
pending categories and the existing content status. Rankings load real rows for
the current authenticated state/profile; guest/empty/error states contain no fake
names or scores. Premium/ads use the existing adapters and service availability.
Screenshot fixtures used during local browser QA were not added to app content.

## State-only onboarding revision — 4 November 2026

Onboarding now asks only for state, using explicitly reviewed `general-first`
content for common practice and lessons. Adult/teen choices remain in authoring
for differences that need them. Exams use a reviewed common rule when available;
otherwise an exam setup page asks age only if age-specific exam content is ready.
The selected exam profile is scoped to its session, not everyday study. Old active
sessions/history/favorites are retained, and common progress includes historical
age-specific results in the same state. A local SQL migration extends the release
profile constraint; it has not been applied remotely and common content has not
been relabeled or published automatically.

## Scope revision — 4 November 2026

The first release targets eight states: CA, TX, FL, NY first, then PA, IL, OH, GA.
Mobile and admin share one target-state list. Onboarding checks published content
for common study and keeps pending/error states disabled, with a retry
control. An existing selection outside the target list returns to onboarding;
old history is retained. Shared authoring composes canonical material using explicit
state/profile source reviews. No reviewed packages were created or published by
this revision; target scope does not imply content readiness.

## Implemented

1. **Isolation**: US app/package/scheme configuration, separate US backend variable
   names, removal of Turkish EAS/submit/OAuth/ad IDs from active config. Existing
   source, editor, SQL, import scripts and generated native folders preserved under
   `legacy/`. Active runtime imports only `src/us`. Generated native archives are
   ignored. Existing `.env` and version/build increments are preserved.
2. **Localization**: English default, Turkish switch, central typed message catalog.
   US content stays English regardless of interface language. No Turkish questions
   were translated or imported.
3. **State-aware engine**: eight target states (CA, TX, FL, NY, PA, IL, OH, GA), car, adult/teen first-time
   profiles, validated reviewed content releases, integer and subsection pass
   criteria, topic-quota assembly. Missing rules/content cannot create an exam.
4. **Learning flow**: dashboard, practice, lessons/signs, favorites, mistake review,
   quizzes, results and topic progress. Active sessions and last 100 results keep
   source/question/rule snapshots locally; state/profile history stays separate.
   Timed exams use absolute deadlines, and show explanations only after completion.
   No paid gates on core practice/review. No active advertising or checkout yet.
5. **Content delivery**: local SQL migration for immutable published release records
   and read-only RLS, a scoped Supabase reader, and a no-upload JSON validator.

## Verified

- `npm run typecheck` passes.
- `npm run test:us`: seven tests pass, including NY signs threshold, 39/40 boundary,
  misleading rounded percentage, invalid source/scope and insufficient exam pools.
- Expo iOS/Android Hermes and web exports complete.
- Web UI: initial English, Turkish toggle, state onboarding, persisted selection,
  dashboard and disabled practice/exam actions with no package verified manually.
- Exported bundles contain no values from the copied Turkish `.env`.
- No native device or store tests; no migration applied to Supabase yet.

## Next phases

- Connect the new Supabase URL/publishable key and apply the US migration there.
- Confirm first state/profile; verify exact exam rules and publish reviewed content.
- Port authentication/account sync and a US authoring/review interface.
- Wire issue reporting, US RevenueCat products/restore and measured ad placements.
- Reserve final bundle/package/EAS IDs; replace icon/store assets and legal texts;
  test on devices and run store/privacy checks.

The current app is a working content-ready foundation, not a store-ready product.

## Design correction — original app as the visual base

The original light ScreenLayout palette, bold typography, rounded cards, large
blue practice tile, icon shortcuts, and tab-bar spacing now inform the US screens.
The original AI Hoca speedometer geometry was ported directly. Its assessment,
practice-accuracy summary, topic analysis and personalized-task flow are restored
as AI Coach in English / AI Hoca in Turkish. Guidance is computed locally from
state/profile-scoped answers; no external model is called. Topic history uses
recent vs preceding answer windows and tracks distinct questions for coverage.
No-data learners receive a start task without a fabricated preparation score.
The onboarding introduction uses the original three-slide visual pattern before
US state/profile setup. No Turkish production services were reconnected.

SDK 58 matches the connected iPhone's Expo Go. Legacy NativeWind and unused native
service dependencies are archived rather than loaded by the active app. Typecheck,
10 engine/coach tests, web mobile-viewport checks and iOS bundle delivery pass.


## Original mobile feature restoration

Grouped settings, the original driving-photo login style, sign-up, email reset,
profile, subscriptions, support/contact/legal routes, rankings, daily challenge,
streak and reward-credit entry points have been ported. English/Turkish catalogs
cover the added screens. Theme and local reminder controls are functional.
Apple/Google/email adapters are prepared but gated until US provider setup.
Account-scoped device history preserves guest progress without merging users.

The second SQL migration provides private profiles, idempotent score recording
with server recomputation from reviewed content, and opt-in scoped rankings.
Both migrations compile in a temporary local PostgreSQL-compatible environment;
checks cover computed scores, duplicate submission, state isolation, opt-out and
anonymous access restrictions. No migration or account deletion was run remotely.
The account deletion Edge Function is prepared for US deployment. Commerce and
reward adapters remain integration points, with no fabricated purchase or reward.

Validation: typecheck, 12 unit tests and iOS bundle delivery pass. Login and grouped
settings were checked at 390×844, including empty-email validation and navigation.
See us-feature-parity.md for the precise feature map and integration handoff.
