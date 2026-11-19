# DMV Practice Test: Smart Prep

Independent US permit preparation app. Expo 58 / React Native / Expo Router,
Zustand with device persistence, optional read-only Supabase content delivery.
English is the default UI; Turkish is retained as a second interface language.
Study content is English and is separate from the interface language.

## Run locally

```sh
npm install
npm start
```

No backend is required to open the app and view the target states.
Onboarding asks only for a state. A state opens when its `general-first` common
study release has validated, published questions. No adult/teen selection is
required for everyday study. Pending states display a preparing status;
existing users still see an empty state if their package is withdrawn. There
are no sample or translated Turkish questions in the US product.

## New US Supabase project

1. Apply `supabase/migrations/202610300001_us_content.sql` to the **new US project**.
2. Apply `supabase/migrations/202611040001_us_general_study.sql` to allow
   `general-first` common releases. Existing adult/teen releases are preserved;
   review and publish common content separately.
3. Add the two `EXPO_PUBLIC_US_*` entries from `.env.us.example` to `.env`.
   Use the project's publishable/anon key, never a service-role key.
4. Restart Expo after changing environment variables.
5. Prepare and validate an English content release before publishing it. See
   [content contract](docs/us-content-contract.md).

The old `.env` is preserved; its Turkish keys are not read by the new runtime.
No migration, upload, user import, account login, ad initialization, purchase or
push-registration request is performed automatically by the app.

## Product foundation

- Eight target states: CA, TX, FL, NY first; PA, IL, OH, GA next. Passenger car
  and common first-time study; state availability follows reviewed publication.
  Age is requested only before an exam requiring an age-specific package.
- Published packages scoped by state/profile/vehicle/language/version.
- Free practice with explanations and handbook sources, topic practice, saved
  questions and latest-answer mistake review (up to 10 questions per session).
- Practice exams require a reviewed rule and sufficient questions for all topic
  quotas. Pass/fail uses integer counts and subsection rules, never rounded scores.
- Exam explanations are hidden until results. No active-exam advertising.
- Session snapshots support resume and absolute exam deadlines across backgrounding.
- On-device results, topic accuracy, saved questions, and deletion controls.
- English/Turkish central dictionary; Spanish can be added alongside those catalogs.

## Shared content authoring

Maintain a canonical question/lesson once, with a reviewed source entry for each
applicable state/profile. Compose it with state-specific material into the existing
release format; exam rules remain specific to the target state/profile.

```sh
npm run compose:content -- /absolute/path/shared-catalog.json /absolute/path/state-draft.json /absolute/path/new-release.json
```

The composer validates and writes a new local file, never uploads, and refuses to
overwrite files. Import the resulting release into the admin panel with the same
state/profile selected. See [content contract](docs/us-content-contract.md) for the
catalog format and review requirements.

## iOS release work

Monthly subscription and lifetime Premium use RevenueCat's US products. AdMob
supports optional rewards and controlled practice-exit interstitials after UMP
consent. Native SDKs require a development build; web and Expo Go keep study usable.
Personal 7-day plans and detailed progress snapshots cost 3 earned study credits
per new generation, or are unlimited with verified Premium. Saved snapshots reopen
without spending again; core study/review remains free.

See [ordered App Store release plan](docs/us-app-store-release-plan.md). Run
`npm run release:check:ios -- --online` for configuration and read-only provider/content
checks. SDK code and a successful simulator build do not mean the external accounts,
reviewed content or App Store production submission are ready.

## Validation

```sh
npm run typecheck
npm run test:us
npm run validate:content -- /absolute/path/release.json CA general-first
npx expo export --platform web
```

Tests require Node 22.6+ (built-in TypeScript stripping). Fixture questions and
rules live only in tests and never enter the application content pool.

## Build identities

`com.dmvsmartprep.app` is a **provisional** new bundle/package ID. Register final
store IDs and a new Expo/EAS project; set `US_IOS_BUNDLE_ID`,
`US_ANDROID_PACKAGE`, `US_EAS_PROJECT_ID` in local/build environments. Turkish EAS,
OAuth, ads, RevenueCat and store-submit IDs were removed from active configuration.
The generated Turkish native folders are archived locally; do not reuse them.
Icons/store artwork remain legacy placeholders and must be replaced before release.

## Remaining phases

The foundation is not a store-ready release. Reviewed content and verified target
profile exam rules are pending. Auth provider configuration and live testing, cross-device history download, an authoring UI,
issue reporting, RevenueCat/ad adapter configuration and consent, remote push notifications,
new legal documents and native device/store testing still need implementation.
Premium is an informational screen; there are no fake prices or checkout buttons.

The complete Turkish implementation is preserved in `legacy/` for reference and
future porting. Its administration panel and scripts are not part of the US runtime.

The mobile visual design follows the original dashboard and onboarding: bold headers, rounded cards, colorful study actions, and the AI Coach assessment/gauge/task flow. The coach currently derives recommendations locally from practice history; no external AI provider is connected.
