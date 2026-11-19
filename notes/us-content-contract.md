# US content release contract

No questions are seeded. A pilot is published only after the source/editing process
is validated. Schema migrations are prepared locally and were not applied remotely.

## Target scope and shared authoring

Updated 4 November 2026. Target states are CA, TX, FL, NY (first group), then
PA, IL, OH, GA (second group). These are editorial priorities, not readiness claims.
Onboarding asks only for a state and enables targets with a valid published
`general-first` common release containing questions. No verified rule means practice only; exams
continue to require verified rules and sufficient topic coverage.

A shared catalog has `questions` and `lessons` arrays. Each entry contains:

```ts
{
  content: Omit<Question, 'source'>, // or Omit<Lesson, 'source'>
  applicability: [
    { state: 'CA', profile: 'general-first', source: { title, url, section, reviewedAt } },
    { state: 'TX', profile: 'general-first', source: { title, url, section, reviewedAt } }
  ]
}
```

The same canonical ID is reused only when prompt, options, correct answer and
explanation (or lesson body) apply unchanged. Every applicability entry requires
its own state/profile source review. Where wording or rules differ, author a
separate state-specific item. Do not infer applicability from similar exam formats.
The schema validates review metadata; editorial accuracy requires actual review.

Prepare a state draft using the release schema below, including its metadata,
state-specific questions/lessons (empty arrays allowed), and its own `rule` (or
`null`). Run `npm run compose:content -- catalog.json draft.json new-release.json`.
Only explicitly matching catalog entries are included; target-specific items are
appended. Duplicate identities, missing source metadata and mismatched rules fail
validation. Exam-ready packages also require sufficient questions for the rule.
The new local output can be imported into the admin panel under the same selected
state/profile. Nothing is uploaded by the composer. The mobile package boundary
is unchanged; the database profile constraint is extended for general study.
There is no cross-state fallback.

Admin scope changes clear the current draft after a discard confirmation. Rules
start unverified, without assumed question counts or durations; an empty rule
verification date publishes practice-only content. Full release imports preserve
state-specific sources, lessons and subsection rules.

## State-only onboarding and optional exam age

- `general-first` is the shared everyday study scope, explicitly reviewed for both
  age groups. It is not an alias or fallback to an adult package. Catalog entries
  need explicit `general-first` applicability; admin defaults to this scope.
- New onboarding selects only the state. Existing installations use general study
  on hydration while retaining old attempts, favorites and active session snapshots.
  General progress includes age-specific history in the same state.
- If a general release has a verified rule applicable to both groups, start the
  exam directly without an age prompt. Editorial review must establish that the
  rule, source explanations, lessons and questions apply to both groups.
- When no common rule is published, opening an exam checks current published
  common/adult/teen releases. Prefer a common exam if it has become available;
  otherwise ask age only when an age-specific exam can be assembled. Unavailable
  age groups stay disabled, and no verified exam means a pending message.
- An age-specific exam keeps its actual profile in the active session, result and
  backend record; choosing it does not change the user's everyday study profile.
  Age-specific packages cannot silently become general practice packages.
- No application/eligibility guide is currently implemented. Any future guide must
  ask age only when its verified state-specific instructions require it; such
  instructions must not be published as common guidance without review.

Apply `202611040001_us_general_study.sql` before publishing common releases. This
additive profile constraint migration does not relabel or overwrite published
adult/teen packages. The migration is prepared locally, not applied remotely.

## Release record

`us_content_releases` is the read-only mobile content boundary. The record has a
UUID `id`, `version`, two-letter `state`, `vehicle=car`, `profile=general-first`, `adult-first` or
`teen-first`, `language=en`, `status`, `reviewer`, `reviewed_at`, `published_at` and
`payload`. Anonymous users can read only published records. They cannot publish,
edit or delete. Published payloads are immutable; withdraw and issue a new version.

`payload` contains `rule` (null until verified), `questions` and `lessons`. Keep a
stable canonical question ID across versions. Do not assign an existing ID to a
new question. Favorites are additionally scoped by state and profile. The client
validates every record before use; it does not fall back to another state/profile.

The JSON below documents fields, and is not a publishable question package:

```ts
{
  rule: null | {
    id: string, version: string, state: string, vehicle: 'car',
    profile: 'general-first' | 'adult-first' | 'teen-first',
    questionCount: number, minimumCorrect: number,
    durationSeconds: number | null, // null when no verified official time limit
    sections: [{ topic: string, questionCount: number, minimumCorrect: number }],
    verifiedAt: string, sourceUrl: string
  },
  questions: [{
    id: string, topic: string, prompt: string, options: string[],
    correctIndex: number, explanation: string, imageUrl?: string,
    source: { title: string, url: string, section: string, reviewedAt: string }
  }],
  lessons: [{
    id: string, topic: string, title: string, body: string,
    source: { title: string, url: string, section: string, reviewedAt: string }
  }]
}
```

Use `road-signs` as the topic key for signs questions and lessons. Other topics
should come from the chosen state's handbook. Section quotas must not overlap;
questions outside those section topics fill the remaining exam positions.

For local validation, create a JSON file containing the payload plus `id`,
`version`, `state`, `vehicle`, `profile`, `language`, and `publishedAt`. Run:

```sh
npm run validate:content -- /absolute/path/release.json CA general-first
```

The validator performs no network access or writes. It checks scope, required
explanations, answer indices, source/review metadata, rule validity and sufficient
exam assembly. Editorial correctness, image rights, official-source authenticity
and coverage still require human review. Do not infer exam readiness from count.

## Source/rule verification notes

Checked 30 October 2026:

- NY DMV manual: 14 of 20 overall AND 2 of 4 road signs. Test fixtures cover the
  failing 14/20 + 1/4 and passing 14/20 + 2/4 cases. No NY package is published.
  https://dmv.ny.gov/book/export/html/1551
- California permit page: 80%; separate adult/teen application requirements.
  https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/learners-permits/
- California preparation page describes three answer choices. Exact current
  question count, duration and topic distribution remain unverified. Do not seed
  36/46 questions or a 45-minute deadline as an official rule.
  https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/preparing-for-knowledge-and-drive-tests/

## History and offline behavior

Completed and active sessions retain question/source, rule and release snapshots.
Changing current packages does not recalculate old results. Only the last 100
completed sessions are retained locally. A new session needs a current published
package from Supabase; downloaded full-package offline mode is not implemented.
An already-started session can resume offline. Withdrawn packages are not offered
for new sessions; an existing session still uses its original snapshot. A future
urgent-revocation mechanism should handle substantive content corrections.

## Study topic headings

The dashboard says **Test topics / Sınav konuları**. Suggested editorial topic IDs
are in `src/us/topics.ts`: road-signs, signals-markings, right-of-way, turns-passing,
speed-distance, parking, safe-driving, alcohol-drugs, special-conditions and
sharing-the-road. These are navigation headings, not a claim that all eight states
have the same official chapters, question quotas or test coverage. Their starting
references are the [California handbook](https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/)
and [New York manual](https://dmv.ny.gov/book/export/html/1551), checked 4 November 2026.

When a question package is present, only its actual topic IDs become active cards;
without a package the suggested headings are shown as preparing. Other reviewed
topic IDs remain usable and receive readable labels. The older road-rules ID is
still supported. Never reclassify existing questions automatically. In particular,
road-signs remains separate from signals/markings for verified signs exam quotas.
Each state release must map topics to its own handbook and reviewed exam scope.
