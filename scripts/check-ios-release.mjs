import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { iosReleaseChecks } from '../src/us/releaseReadiness.ts';
import { STATES } from '../src/us/states.ts';
import { validateRelease, assembleExam } from '../src/us/engine.ts';
const require = createRequire(import.meta.url);
process.env.NODE_ENV ||= 'production';
require('@expo/env').load(process.cwd());
const { exp } = require('expo/config').getConfig(process.cwd());
const eas = JSON.parse(readFileSync('eas.json','utf8'));
const checks = iosReleaseChecks(process.env, { bundleId: exp.ios?.bundleIdentifier, easProjectId: exp.extra?.eas?.projectId, ascAppId: eas.submit?.production?.ios?.ascAppId });
let failed = false;
for (const check of checks) {
 console.log(`${check.ok ? 'PASS' : 'TODO'} ${check.name}${check.ok ? '' : ': ' + check.action}`);
 if (!check.ok) failed = true;
}
if (process.argv.includes('--online')) {
 const base = process.env.EXPO_PUBLIC_US_SUPABASE_URL;
 const key = process.env.EXPO_PUBLIC_US_SUPABASE_PUBLISHABLE_KEY;
 if (!base || !key) { console.log('TODO online verification: US backend is not configured.'); failed = true; }
 else {
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  try {
   const response = await fetch(`${base}/auth/v1/settings`, { headers, signal: AbortSignal.timeout(15000) });
   if (!response.ok) throw new Error();
   const settings = await response.json();
   for (const provider of ['google','apple','email']) {
    const ok = settings.external?.[provider] === true;
    console.log(`${ok ? 'PASS' : 'TODO'} Supabase ${provider} provider`);
    if (!ok) failed = true;
   }
  } catch { console.log('TODO could not verify Supabase provider settings.'); failed = true; }
  const results = await Promise.all(STATES.map(async ({ code, phase }) => {
   try {
    const query = new URLSearchParams({ select: 'id,version,state,profile,vehicle,language,published_at,payload', state: `eq.${code}`, vehicle:'eq.car',language:'eq.en',status:'eq.published',order:'published_at.desc' });
    const response = await fetch(`${base}/rest/v1/us_content_releases?${query}`, { headers, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error();
    const rows = await response.json();
    const latest = new Map();
    for (const row of rows) if (!latest.has(row.profile)) latest.set(row.profile,row);
    const releases = [...latest.values()].map((row) => validateRelease({ ...row.payload, id:row.id,version:row.version,state:row.state,profile:row.profile,vehicle:row.vehicle,language:row.language,publishedAt:row.published_at },code,row.profile));
    const common = releases.find((release) => release.profile === 'general-first');
    const exam = releases.some((release) => { if (!release.rule) return false; try { assembleExam(release.questions,release.rule); return true; } catch { return false; } });
    return { code, phase, ready: !!common?.questions.length && !!common?.lessons.length && exam };
   } catch { return {code,phase,ready:false}; }
  }));
  for (const result of results) {
   console.log(`${result.ready ? 'PASS' : result.phase === 1 ? 'TODO' : 'LATER'} ${result.code}: reviewed common questions, lessons and verified exam`);
   if (result.phase === 1 && !result.ready) failed = true;
  }
 }
} else console.log('INFO Add --online to verify published content and provider settings (read-only).');
console.log('INFO Passing config checks does not replace device, StoreKit sandbox, ad consent, editorial, privacy, App Store identity and reviewer-access checks.');
process.exitCode = failed ? 1 : 0;
