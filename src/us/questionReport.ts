import type { Attempt, Question } from './model.ts';
export function questionReportUrl(email: string, attempt: Pick<Attempt, 'state' | 'profile' | 'releaseId' | 'releaseVersion'>, question: Question) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('support_not_configured');
  const body = [
    'Please describe the issue:', '', '',
    `State: ${attempt.state}`, `Study scope: ${attempt.profile}`,
    `Release: ${attempt.releaseId} (${attempt.releaseVersion})`,
    `Question: ${question.id}`, `Topic: ${question.topic}`,
    `Source: ${question.source.url}`, `Section: ${question.source.section}`,
  ].join('\n');
  return `mailto:${email}?subject=${encodeURIComponent('DMV Smart Prep - Question issue')}&body=${encodeURIComponent(body)}`;
}
