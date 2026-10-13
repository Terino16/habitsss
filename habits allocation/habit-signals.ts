import { PAIN_HABITS, NICHE_HABITS } from './concern-relevance';
import type { GoalId } from './types';

export const CONTEXT_OPTIONS = [
  { id: 'siblings', label: 'This child has siblings' },
  { id: 'bedwetting', label: 'We are supporting this child with bedwetting' },
  { id: 'bullying_others', label: 'This child needs help to stop bullying others' },
  { id: 'period_preparation', label: 'We are preparing for or managing periods' },
  { id: 'teacher_meeting', label: 'A teacher meeting is coming up' },
  { id: 'choosing_phone_plan', label: 'We are choosing a phone plan for this teen' },
  { id: 'new_online_account', label: 'We are setting up a new online account' },
] as const;

const PAIN_SIGNALS: Record<string, readonly string[]> = {
  'sleep:long': ['bedtime_resistance'],
  'sleep:leaves': ['bedtime_resistance'],
  'sleep:fears': ['anxiety', 'bedtime_resistance'],
  'sleep:settle': ['bedtime_resistance'],
  'sleep:inconsistent': ['bedtime_resistance'],
  'eating:refuses': ['picky_eating'],
  'eating:beige': ['picky_eating'],
  'eating:battle': ['picky_eating', 'conflict'],
  'eating:snacks': ['picky_eating'],
  'eating:new': ['picky_eating'],
  'eating:pressure': ['picky_eating'],
  'focus:homework': ['homework_conflict', 'difficulty_starting_tasks', 'attention_difficulty'],
  'focus:instructions': ['attention_difficulty', 'difficulty_starting_tasks'],
  'focus:still': ['attention_difficulty'],
  'focus:mornings': ['morning_chaos', 'attention_difficulty'],
  'focus:transitions': ['transition_meltdowns', 'attention_difficulty'],
  'emotional:meltdown': ['transition_meltdowns'],
  'emotional:worry': ['anxiety'],
  'emotional:anger': ['frequent_yelling', 'conflict'],
  'emotional:shutdown': ['anxiety'],
  'emotional:bedtime': ['bedtime_resistance', 'anxiety'],
  'school:going': ['morning_chaos', 'morning_resistance'],
  'school:homework': ['homework_conflict', 'difficulty_starting_tasks'],
  'school:friends': ['friendship_difficulty'],
  'school:focus': ['attention_difficulty', 'difficulty_starting_tasks'],
  'school:confidence': ['low_confidence', 'school_anxiety'],
  'behaviour:listen': ['conflict'],
  'behaviour:back': ['conflict', 'frequent_yelling'],
  'behaviour:hits': ['frequent_yelling', 'conflict'],
  'behaviour:dawdle': ['morning_chaos', 'difficulty_starting_tasks'],
  'behaviour:power': ['conflict'],
  'screens:put-down': ['screen_stopping_conflict'],
  'screens:arguments': ['screen_stopping_conflict', 'conflict'],
  'screens:too-much': ['screen_stopping_conflict'],
  'screens:bedtime': ['bedtime_resistance', 'screen_stopping_conflict'],
  'communication:siblings': ['siblings'],
  'communication:discipline': ['conflict'],
  'communication:school': ['homework_conflict'],
  'confidence:new': ['low_confidence'],
  'confidence:mistakes': ['low_confidence'],
  'confidence:friends': ['friendship_difficulty', 'low_confidence'],
  'confidence:school': ['low_confidence', 'school_anxiety'],
  'confidence:speak': ['low_confidence'],
  'connection:mornings': ['morning_chaos'],
  'connection:bedtime': ['bedtime_resistance'],
};

const NICHE_SIGNALS: Record<string, readonly string[]> = {
  'sleep:scared': ['anxiety', 'bedtime_resistance'],
  'sleep:screens': ['bedtime_resistance'],
  'sleep:wired': ['bedtime_resistance'],
  'sleep:room': ['bedtime_resistance'],
  'focus:homework': ['homework_conflict', 'difficulty_starting_tasks', 'attention_difficulty'],
  'focus:mornings': ['morning_chaos', 'attention_difficulty'],
  'focus:transitions': ['transition_meltdowns', 'attention_difficulty'],
  'focus:still': ['attention_difficulty'],
  'focus:instructions': ['attention_difficulty', 'difficulty_starting_tasks'],
  'emotional:worry': ['anxiety'],
  'emotional:meltdown': ['transition_meltdowns'],
  'school:going': ['morning_chaos', 'morning_resistance'],
  'school:homework': ['homework_conflict'],
  'school:friends': ['friendship_difficulty'],
  'school:confidence': ['low_confidence', 'school_anxiety'],
  'screens:meltdown': ['screen_stopping_conflict', 'transition_meltdowns'],
  'screens:argument': ['screen_stopping_conflict', 'conflict'],
  'screens:five-more': ['screen_stopping_conflict'],
  'screens:ignores': ['screen_stopping_conflict'],
  'communication:siblings': ['siblings'],
  'confidence:friends': ['friendship_difficulty'],
  'connection:mornings': ['morning_chaos'],
};

export function profileSignals(input: {
  goals: GoalId[];
  painId?: string | null;
  nicheId?: string | null;
  contextSignals?: readonly string[];
}): Set<string> {
  const signals = new Set<string>((input.contextSignals ?? []).filter((signal) =>
    CONTEXT_OPTIONS.some((option) => option.id === signal)));
  const primary = input.goals[0];
  if (primary && input.painId) {
    if (PAIN_HABITS[`${primary}:${input.painId}`]) signals.add(`pain:${primary}:${input.painId}`);
    for (const signal of PAIN_SIGNALS[`${primary}:${input.painId}`] ?? []) {
      signals.add(signal);
    }
  }
  if (primary && input.nicheId) {
    if (NICHE_HABITS[`${primary}:${input.nicheId}`]) signals.add(`niche:${primary}:${input.nicheId}`);
    for (const signal of NICHE_SIGNALS[`${primary}:${input.nicheId}`] ?? []) {
      signals.add(signal);
    }
  }
  return signals;
}
