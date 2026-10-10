import type { GoalId } from './types';

const GOAL_SIGNALS: Record<GoalId, readonly string[]> = {
  sleep: ['bedtime_resistance'],
  eating: ['picky_eating'],
  focus: ['adhd', 'difficulty_starting_tasks'],
  emotional: ['anxiety', 'transition_meltdowns'],
  school: ['homework_conflict'],
  behaviour: ['conflict', 'frequent_yelling'],
  screens: ['screen_stopping_conflict'],
  communication: [],
  confidence: ['low_confidence'],
  connection: [],
};

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
  'focus:homework': ['homework_conflict', 'difficulty_starting_tasks', 'adhd'],
  'focus:instructions': ['adhd', 'difficulty_starting_tasks'],
  'focus:still': ['adhd'],
  'focus:mornings': ['morning_chaos', 'adhd'],
  'focus:transitions': ['transition_meltdowns', 'adhd'],
  'emotional:meltdown': ['transition_meltdowns'],
  'emotional:worry': ['anxiety'],
  'emotional:anger': ['frequent_yelling', 'conflict'],
  'emotional:shutdown': ['anxiety'],
  'emotional:bedtime': ['bedtime_resistance', 'anxiety'],
  'school:going': ['school_anxiety', 'morning_resistance', 'separation_anxiety'],
  'school:homework': ['homework_conflict', 'difficulty_starting_tasks'],
  'school:friends': ['friendship_difficulty'],
  'school:focus': ['adhd', 'difficulty_starting_tasks'],
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
  'focus:homework': ['homework_conflict', 'difficulty_starting_tasks', 'adhd'],
  'focus:mornings': ['morning_chaos', 'adhd'],
  'focus:transitions': ['transition_meltdowns', 'adhd'],
  'focus:still': ['adhd'],
  'focus:instructions': ['adhd', 'difficulty_starting_tasks'],
  'emotional:worry': ['anxiety'],
  'emotional:meltdown': ['transition_meltdowns'],
  'school:going': ['school_anxiety', 'separation_anxiety', 'morning_resistance'],
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
}): Set<string> {
  const signals = new Set<string>();
  for (const goal of input.goals) {
    for (const signal of GOAL_SIGNALS[goal] ?? []) {
      signals.add(signal);
    }
  }
  const primary = input.goals[0];
  if (primary && input.painId) {
    for (const signal of PAIN_SIGNALS[`${primary}:${input.painId}`] ?? []) {
      signals.add(signal);
    }
  }
  if (primary && input.nicheId) {
    for (const signal of NICHE_SIGNALS[`${primary}:${input.nicheId}`] ?? []) {
      signals.add(signal);
    }
  }
  return signals;
}
