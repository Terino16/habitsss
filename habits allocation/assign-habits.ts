import { concernScore, concernMatches } from './concern-relevance';
import catalogJson from './daily-habits.json';

import type {
  AssignedHabit,
  GoalId,
  GuidanceLevel,
  HabitFrequency,
  HabitKind,
  HabitMark,
  HabitPriority,
  HabitTarget,
  HabitTime,
} from './types';

type AgeVariantBand = '2-4y' | '5-8y' | '9-12y' | '13-18y';

export const DAYPARTS = ['Morning', 'Afternoon', 'Evening'] as const;
export type Daypart = (typeof DAYPARTS)[number];

const GOAL_CATEGORIES: Record<GoalId, readonly string[]> = {
  sleep: ['sleep'],
  eating: ['nutrition'],
  focus: ['school'],
  emotional: ['emotional_regulation'],
  school: ['school', 'learning'],
  behaviour: ['behaviour', 'independence'],
  screens: ['digital'],
  communication: ['social', 'connection'],
  confidence: ['confidence'],
  connection: ['connection', 'parent_skills'],
};

const GOAL_TAGS: Record<GoalId, readonly string[]> = {
  sleep: ['better_sleep'],
  eating: ['healthier_meals'],
  focus: ['better_focus'],
  emotional: ['emotional_wellbeing', 'anxiety'],
  school: ['school_support'],
  behaviour: ['better_cooperation', 'less_conflict', 'easier_transitions'],
  screens: ['calmer_screens'],
  communication: ['better_talk'],
  confidence: ['more_confidence'],
  connection: ['closer_connection'],
};

const FOCUS_TAGS = new Set(['attention_difficulty', 'executive_function']);
const FOUNDATION_ROLES = new Set([
  'morning_health',
  'afternoon_regulation',
  'evening_family',
]);
const ANCHOR_ROLES = {
  light: {
    Morning: ['morning_health', 'morning_goal'],
    Afternoon: ['afternoon_regulation', 'afternoon_skill'],
    Evening: ['evening_family', 'evening_connection'],
  },
  balanced: {
    Morning: ['morning_health', 'morning_independence', 'morning_goal'],
    Afternoon: ['afternoon_regulation', 'afternoon_movement', 'afternoon_skill'],
    Evening: ['evening_family', 'evening_prep', 'evening_connection'],
  },
} as const;
const ROLE_CATEGORIES: Record<string, readonly string[]> = {
  morning_health: ['hygiene', 'nutrition', 'sleep'],
  morning_independence: ['independence', 'school', 'behaviour', 'learning'],
  morning_goal: [],
  afternoon_regulation: ['emotional_regulation', 'connection', 'nutrition'],
  afternoon_movement: ['movement'],
  afternoon_skill: [],
  evening_family: ['nutrition', 'connection', 'digital'],
  evening_prep: ['independence', 'school', 'learning'],
  evening_connection: ['connection', 'sleep', 'parent_skills', 'confidence', 'emotional_regulation'],
};
const ROLE_DAYPART: Record<string, Daypart> = {
  morning_health: 'Morning',
  morning_independence: 'Morning',
  morning_goal: 'Morning',
  afternoon_regulation: 'Afternoon',
  afternoon_movement: 'Afternoon',
  afternoon_skill: 'Afternoon',
  evening_family: 'Evening',
  evening_prep: 'Evening',
  evening_connection: 'Evening',
};
const PROFILE_MAX = 35;
const SKILL_COUNT = 3;
const GOAL_WEIGHTS = [100, 80, 65];

type CatalogHabit = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  gender?: string;
  ageGroups: string[];
  defaultTime: string;
  tags?: string[];
  priority?: HabitPriority;
  frequency?: HabitFrequency;
  habitType?: HabitKind;
  target?: HabitTarget;
  cluster?: string;
  goalTags?: string[];
  recommendedWhen?: string[];
  prompts?: string[];
  variants?: Partial<Record<AgeVariantBand, string>>;
  ageVersions?: {
    minAge: number;
    maxAge: number;
    title: string;
    subtitle: string;
    description: string;
    sources: string[];
  }[];
  activeMonths?: number[];
  minAge?: number;
  maxAge?: number;
  requiredSignals?: string[];
};

export type HabitAssignment = {
  habits: AssignedHabit[];
  profile: AssignedHabit[];
  anchors: AssignedHabit[];
  skills: AssignedHabit[];
};

export type AssignHabitsInput = {
  age: number;
  goals: GoalId[];
  signals?: Iterable<string>;
  guidance?: GuidanceLevel | null;
  marks?: Record<string, HabitMark>;
  childKey?: string;
  date?: Date;
};

const catalog = catalogJson as CatalogHabit[];
const catalogById = new Map(catalog.map((habit) => [habit.id, habit]));

export function catalogAgeGroup(age: number) {
  if (age <= 4) return '2-4y';
  if (age <= 8) return '5-8y';
  if (age <= 12) return '9-12y';
  return '13-18y';
}

export function resolveGuidance(guidance?: GuidanceLevel | null): GuidanceLevel {
  return guidance ?? 'balanced';
}

export function dailyQuota(guidance?: GuidanceLevel | null): Record<Daypart, number> {
  const level = resolveGuidance(guidance);
  if (level === 'light') return { Morning: 2, Afternoon: 2, Evening: 2 };
  if (level === 'hands_on') return { Morning: 4, Afternoon: 4, Evening: 4 };
  return { Morning: 3, Afternoon: 3, Evening: 3 };
}

export function habitTimeLabel(time: HabitTime) {
  return time === 'Event-based' ? 'When it happens' : time;
}

export function habitFrequencyLabel(frequency: HabitFrequency) {
  switch (frequency) {
    case 'daily':
      return 'Daily';
    case 'few_times_week':
      return 'A few times a week';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'seasonal':
      return 'In season';
    case 'one_time_learning':
      return 'Until learned';
    case 'event_based':
    case 'opportunity_based':
      return 'When it happens';
  }
}

export function habitTimeEmoji(time: HabitTime) {
  switch (time) {
    case 'Morning':
      return '🌞';
    case 'Afternoon':
      return '🍎';
    case 'Evening':
      return '🌙';
    case 'All day':
      return '🌿';
    case 'Event-based':
      return '⚡';
  }
}

export function todaysPrompt(prompts: string[], now = new Date()) {
  if (prompts.length === 0) return undefined;
  const start = Date.UTC(now.getFullYear(), 0, 1);
  const current = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const day = Math.floor((current - start) / 86_400_000);
  return prompts[day % prompts.length];
}

export function groupHabits(habits: AssignedHabit[]) {
  const sections: { time: HabitTime; label: string }[] = [
    { time: 'Morning', label: 'Morning' },
    { time: 'Afternoon', label: 'Afternoon' },
    { time: 'Evening', label: 'Evening' },
    { time: 'All day', label: 'All day' },
    { time: 'Event-based', label: 'When it happens' },
  ];
  return sections
    .map((section) => ({
      label: section.label,
      habits: habits.filter((habit) => habit.defaultTime === section.time),
    }))
    .filter((section) => section.habits.length > 0);
}

function normalizeTime(value: string): HabitTime {
  if (value === 'All Day' || value === 'All day') return 'All day';
  if (value === 'Morning' || value === 'Afternoon' || value === 'Evening' || value === 'Event-based') {
    return value;
  }
  return 'Event-based';
}

function inferDaypart(habit: CatalogHabit): Daypart | undefined {
  const time = normalizeTime(habit.defaultTime);
  if (time === 'Morning' || time === 'Afternoon' || time === 'Evening') return time;
  if (time !== 'All day') return undefined;
  if (['hygiene', 'nutrition', 'sleep'].includes(habit.category)) return 'Morning';
  if (['movement', 'school', 'digital', 'emotional_regulation'].includes(habit.category)) return 'Afternoon';
  return 'Evening';
}

function habitFrequency(habit: { frequency?: HabitFrequency }): HabitFrequency {
  return habit.frequency ?? 'daily';
}

function habitPriority(habit: CatalogHabit): HabitPriority {
  return habit.priority ?? 'recommended';
}

function allowedGender(habit: CatalogHabit) {
  return !habit.gender || habit.gender === 'both';
}

type GoalMatchHabit = Pick<CatalogHabit, 'category' | 'goalTags' | 'tags'>;

function matchesGoal(habit: GoalMatchHabit, goal: GoalId) {
  if (GOAL_CATEGORIES[goal].includes(habit.category)) return true;
  if ((habit.goalTags ?? []).some((tag) => GOAL_TAGS[goal].includes(tag))) return true;
  return goal === 'focus' && (habit.tags ?? []).some((tag) => FOCUS_TAGS.has(tag));
}

export function matchingGoals(habit: GoalMatchHabit, goals: GoalId[]) {
  return goals.filter((goal) => matchesGoal(habit, goal));
}

function resolveCopy(habit: CatalogHabit, age: number) {
  const version = habit.ageVersions?.find(item => age >= item.minAge && age <= item.maxAge);
  return {
    title: version?.title ?? habit.title,
    subtitle: version?.subtitle ?? habit.subtitle,
    description: version?.description ?? habit.variants?.[catalogAgeGroup(age)] ?? habit.description,
  };
}

function toAssigned(
  habit: CatalogHabit,
  age: number,
  extras?: { foundation?: boolean; time?: HabitTime; role?: string; score?: number },
): AssignedHabit {
  return {
    id: habit.id,
    ...resolveCopy(habit, age),
    defaultTime: extras?.time ?? normalizeTime(habit.defaultTime),
    category: habit.category,
    frequency: habitFrequency(habit),
    priority: habitPriority(habit),
    habitType: habit.habitType ?? 'routine',
    target: habit.target ?? 'parent',
    cluster: habit.cluster,
    prompts: habit.prompts,
    activeMonths: habit.activeMonths,
    foundation: extras?.foundation,
    role: extras?.role,
    score: extras?.score,
  };
}

function isTeenOnly(habit: CatalogHabit) {
  return (habit.tags ?? []).includes('teen') || habit.ageGroups.every((group) => group === '13-18y');
}

function allowedForAge(habit: CatalogHabit, age: number) {
  return Number.isInteger(age) && age >= 2 && age <= 18 && allowedGender(habit)
    && habit.ageGroups.includes(catalogAgeGroup(age))
    && age >= (habit.minAge ?? 2) && age <= (habit.maxAge ?? 18)
    && !(age < 13 && isTeenOnly(habit))
    && !(age < 9 && habit.category === 'puberty');
}

function missingContext(habit: CatalogHabit, context: ScoreContext) {
  return (habit.requiredSignals ?? []).filter((signal) => !context.signals.has(signal));
}

function relevant(habit: CatalogHabit, context: ScoreContext) {
  return concernScore(habit.id, context.signals) > 0
    || matchingGoals(habit, context.goals).length > 0
    || (habit.recommendedWhen ?? []).some((signal) => context.signals.has(signal))
    || (!!habit.requiredSignals?.length && missingContext(habit, context).length === 0);
}

function eligible(habit: CatalogHabit, context: ScoreContext) {
  return allowedForAge(habit, context.age) && missingContext(habit, context).length === 0;
}

function profileCandidate(habit: CatalogHabit, context: ScoreContext) {
  const baseline = habitFrequency(habit) === 'daily'
    && ['hygiene', 'nutrition', 'movement', 'connection'].includes(habit.category)
    && ['foundation', 'recommended'].includes(habitPriority(habit));
  return eligible(habit, context) && isRoutineCandidate(habit) && (relevant(habit, context) || baseline);
}

function completedLearning(habit: CatalogHabit, context: ScoreContext) {
  const today = context.date;
  const cutoff = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return habitFrequency(habit) === 'one_time_learning'
    && habitMarkHistory(context.marks, context.childKey, habit.id)
      .some((row) => row.date <= cutoff && row.mark === 'ontime');
}

function availableToday(habit: CatalogHabit, context: ScoreContext) {
  return eligible(habit, context) && isRoutineCandidate(habit)
    && !completedLearning(habit, context) && isHabitDue(habit as AssignedHabit, context.date);
}

function distinctFrom(habit: CatalogHabit, selected: CatalogHabit[], goals: GoalId[]) {
  return !selected.some((other) => other.id === habit.id || other.title === habit.title)
    && (!habit.cluster || selected.filter((other) => other.cluster === habit.cluster).length < clusterCap(habit.cluster, goals));
}

function isOpportunity(habit: CatalogHabit) {
  const frequency = habitFrequency(habit);
  return habit.habitType === 'opportunity' || frequency === 'event_based' || frequency === 'opportunity_based';
}

function isRoutineCandidate(habit: CatalogHabit) {
  return !isOpportunity(habit) && habit.category !== 'safety' && habit.category !== 'puberty';
}

function habitHash(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function isHabitDue(
  habit: Pick<AssignedHabit, 'id' | 'frequency' | 'activeMonths'>,
  date: Date,
  marks?: Record<string, HabitMark | undefined>,
) {
  const frequency = habitFrequency(habit);
  const weekday = date.getDay();
  const hash = habitHash(habit.id);
  switch (frequency) {
    case 'daily':
      return true;
    case 'few_times_week': {
      const start = hash % 7;
      return weekday === start || weekday === (start + 2) % 7 || weekday === (start + 4) % 7;
    }
    case 'weekly':
    case 'one_time_learning':
      if (frequency === 'one_time_learning' && marks?.[habit.id] === 'ontime') return false;
      return weekday === hash % 7;
    case 'monthly':
      return date.getDate() === (hash % 28) + 1;
    case 'seasonal':
      return (habit.activeMonths ?? []).includes(date.getMonth() + 1);
    case 'event_based':
    case 'opportunity_based':
      return false;
  }
}

export function habitMarkHistory(
  marks: Record<string, HabitMark> | undefined,
  childKey: string | undefined,
  habitId: string,
) {
  if (!marks || !childKey) return [];
  const prefix = `${childKey}:`;
  const rows: { date: string; mark: HabitMark }[] = [];
  for (const [key, mark] of Object.entries(marks)) {
    if (!key.startsWith(prefix)) continue;
    const rest = key.slice(prefix.length);
    const dated = rest.match(/^(\d{4}-\d{2}-\d{2}):(.+)$/);
    if (!dated || dated[2] !== habitId) continue;
    rows.push({ date: dated[1] ?? '', mark });
  }
  return rows.sort((left, right) => left.date.localeCompare(right.date));
}

export function isHabitGraduated(
  marks: Record<string, HabitMark> | undefined,
  childKey: string | undefined,
  habitId: string,
) {
  return habitMarkHistory(marks, childKey, habitId).filter((row) => row.mark === 'ontime').length >= 14;
}

export function isHabitFatigued(
  marks: Record<string, HabitMark> | undefined,
  childKey: string | undefined,
  habitId: string,
) {
  const lastTen = habitMarkHistory(marks, childKey, habitId).slice(-10);
  if (lastTen.length < 10) return false;
  return lastTen.filter((row) => row.mark === 'ontime').length >= 7;
}

export function everCompleted(
  marks: Record<string, HabitMark> | undefined,
  childKey: string | undefined,
  habitId: string,
) {
  return habitMarkHistory(marks, childKey, habitId).some((row) => row.mark === 'ontime');
}

export function clusterCap(cluster: string | undefined, goals: GoalId[]) {
  if (!cluster) return Number.POSITIVE_INFINITY;
  if (cluster === 'daily_movement' && goals.includes('focus')) return 2;
  return 1;
}

export function isoWeek(date: Date) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

type ScoreContext = {
  age: number;
  goals: GoalId[];
  signals: Set<string>;
  date: Date;
  marks?: Record<string, HabitMark>;
  childKey?: string;
  selected?: CatalogHabit[];
  daypart?: Daypart;
  usedClusters?: Set<string>;
  categoryCounts?: Map<string, number>;
  targetCounts?: Map<string, number>;
};

export function scoreHabit(habit: CatalogHabit, context: ScoreContext) {
  const matched = matchingGoals(habit, context.goals);
  let score = concernScore(habit.id, context.signals);
  for (const goal of matched) {
    const index = context.goals.indexOf(goal);
    if (index >= 0 && index < GOAL_WEIGHTS.length) score += GOAL_WEIGHTS[index] ?? 0;
  }
  if (matched.length >= 2) score += 25;
  if (habit.ageGroups.includes(catalogAgeGroup(context.age))) score += 35;
  const matchedSignals = [...new Set([...(habit.recommendedWhen ?? []), ...(habit.tags ?? [])])]
    .filter((signal) => context.signals.has(signal));
  score += 25 * Math.min(matchedSignals.length, 2);
  if (habitPriority(habit) === 'foundation') score += 20;
  if (habitPriority(habit) === 'targeted' && matchedSignals.length > 0) score += 15;
  const time = normalizeTime(habit.defaultTime);
  if (context.daypart && time === context.daypart) score += 15;
  const parentCount = [...(context.targetCounts?.entries() ?? [])]
    .filter(([target]) => target === 'parent')
    .reduce((sum, [, count]) => sum + count, 0);
  const childCount = [...(context.targetCounts?.entries() ?? [])]
    .filter(([target]) => target === 'child')
    .reduce((sum, [, count]) => sum + count, 0);
  const target = habit.target ?? 'parent';
  if (target === 'child' && parentCount > childCount) score += 10;
  if (target === 'parent' && childCount > parentCount) score += 10;
  if (target === 'family') score += 5;
  if (habitFrequency(habit) === 'daily' || habitPriority(habit) === 'foundation') score += 10;
  if (habit.cluster && context.usedClusters?.has(habit.cluster)) score -= 50;
  if ((context.categoryCounts?.get(habit.category) ?? 0) >= 2) score -= 30;
  if ((context.targetCounts?.get(target) ?? 0) >= 3) score -= 25;
  return score;
}

function compareScored(left: CatalogHabit, right: CatalogHabit, context: ScoreContext) {
  return scoreHabit(right, context) - scoreHabit(left, context) || left.id.localeCompare(right.id);
}

function fitsRole(habit: CatalogHabit, role: string, goals: GoalId[]) {
  const categories = ROLE_CATEGORIES[role] ?? [];
  if (categories.length === 0) return matchingGoals(habit, goals).length > 0;
  return categories.includes(habit.category);
}

function preferredForRole(habit: CatalogHabit, role: string) {
  const daypart = ROLE_DAYPART[role];
  const time = normalizeTime(habit.defaultTime);
  return time === daypart || time === 'All day';
}

function pickForRole(
  role: string,
  pool: CatalogHabit[],
  context: ScoreContext,
  usedIds: Set<string>,
) {
  const daypart = ROLE_DAYPART[role];
  const roleContext = { ...context, daypart };
  // Do not let an earlier generic habit consume a cluster needed by a more
  // relevant concern-specific habit later in the day (for example listening
  // in the evening versus generic connection time in the afternoon).
  const reserved = pool.filter(habit => availableToday(habit, context)
    && concernScore(habit.id, context.signals) > 0);
  const eligible = pool.filter(
    (habit) => !usedIds.has(habit.id) && availableToday(habit, context)
      && !(habit.cluster && reserved.some(other => other.id !== habit.id
        && other.cluster === habit.cluster
        && concernScore(other.id, context.signals) > concernScore(habit.id, context.signals)))
      && distinctFrom(habit, context.selected ?? [], context.goals)
      && (fitsRole(habit, role, context.goals)
        || (!FOUNDATION_ROLES.has(role) && concernScore(habit.id, context.signals) > 0))
      && preferredForRole(habit, role),
  );
  const ranked = [...eligible].sort((left, right) => compareScored(left, right, roleContext));
  return ranked[0];
}

function withFallback(role: string, context: ScoreContext, usedIds: Set<string>) {
  // Widen the pool, never the eligibility, frequency, or diversity rules.
  return pickForRole(role, catalog.filter((habit) => profileCandidate(habit, context)), context, usedIds);
}

function buildProfile(context: ScoreContext) {
  return catalog.filter((habit) => profileCandidate(habit, context))
    .sort((left, right) => compareScored(left, right, context)).slice(0, PROFILE_MAX);
}

function rolesFor(guidance: GuidanceLevel): readonly string[] {
  const table = guidance === 'light' ? ANCHOR_ROLES.light : ANCHOR_ROLES.balanced;
  return DAYPARTS.flatMap((daypart) => table[daypart]);
}

function pickSkills(context: ScoreContext, week: number) {
  const ranked = catalog.filter((habit) => eligible(habit, context) && relevant(habit, context)
    && isOpportunity(habit) && !completedLearning(habit, context))
    .sort((left, right) => compareScored(left, right, context));
  // Rotate only between comparably relevant choices, never through the entire catalog.
  const topScore = ranked[0] ? scoreHabit(ranked[0], context) : 0;
  const shortlist = ranked.filter((habit) => scoreHabit(habit, context) >= topScore - 20).slice(0, 8);
  const start = shortlist.length ? (week + habitHash(context.childKey ?? '')) % shortlist.length : 0;
  const rotated = [...shortlist.slice(start), ...shortlist.slice(0, start)];
  // Keep the best concern-specific skill visible; rotate the remaining peers.
  if (ranked[0] && concernScore(ranked[0].id, context.signals) > 0) {
    rotated.splice(rotated.indexOf(ranked[0]), 1);
    rotated.unshift(ranked[0]);
  }
  const selected: CatalogHabit[] = [];
  for (const habit of rotated) {
    if (selected.length >= SKILL_COUNT) break;
    if (distinctFrom(habit, selected, context.goals)) selected.push(habit);
  }
  return selected;
}

function pickExtras(profile: CatalogHabit[], anchors: CatalogHabit[], context: ScoreContext, week: number, include: boolean) {
  if (!include) return [];
  const selected = [...anchors];
  const extras: { habit: CatalogHabit; slot: Daypart }[] = [];
  for (const slot of DAYPARTS) {
    const local = { ...context, daypart: slot };
    const ranked = profile.filter((habit) => availableToday(habit, context)
      && distinctFrom(habit, selected, context.goals)
      && (normalizeTime(habit.defaultTime) === slot || normalizeTime(habit.defaultTime) === 'All day'))
      .sort((left, right) => compareScored(left, right, local));
    if (!ranked.length) continue;
    const topScore = scoreHabit(ranked[0], local);
    const shortlist = ranked.filter((habit) => scoreHabit(habit, local) >= topScore - 20).slice(0, 3);
    const habit = shortlist[(week + habitHash(slot + (context.childKey ?? ''))) % shortlist.length];
    extras.push({ habit, slot });
    selected.push(habit);
  }
  return extras;
}

export function assignHabits(input: AssignHabitsInput): HabitAssignment {
  if (input.goals.length === 0 || !Number.isInteger(input.age) || input.age < 2 || input.age > 18) {
    return { habits: [], profile: [], anchors: [], skills: [] };
  }

  const guidance = resolveGuidance(input.guidance);
  const date = input.date ?? new Date();
  const week = isoWeek(date);
  const signals = new Set(input.signals ?? []);
  const context: ScoreContext = {
    age: input.age,
    goals: [...new Set(input.goals)].slice(0, 3),
    signals,
    date,
    marks: input.marks,
    childKey: input.childKey,
  };

  const profile = buildProfile(context);
  const usedIds = new Set<string>();
  const anchors: CatalogHabit[] = [];
  const assignedTimes = new Map<string, Daypart>();
  const assignedRoles = new Map<string, string>();
  const assignedScores = new Map<string, number>();

  for (const role of rolesFor(guidance)) {
    const daypart = ROLE_DAYPART[role];
    const roleContext: ScoreContext = {
      ...context,
      daypart,
      selected: anchors,
      usedClusters: new Set(anchors.flatMap((habit) => (habit.cluster ? [habit.cluster] : []))),
      categoryCounts: anchors.reduce((counts, habit) => {
        counts.set(habit.category, (counts.get(habit.category) ?? 0) + 1);
        return counts;
      }, new Map<string, number>()),
      targetCounts: anchors.reduce((counts, habit) => {
        const target = habit.target ?? 'parent';
        counts.set(target, (counts.get(target) ?? 0) + 1);
        return counts;
      }, new Map<string, number>()),
    };

    const pool = profile;
    let next = pickForRole(role, pool, roleContext, usedIds);
    if (!next) next = withFallback(role, roleContext, usedIds);
    if (!next) continue;
    usedIds.add(next.id);
    anchors.push(next);
    assignedTimes.set(next.id, daypart);
    assignedRoles.set(next.id, role);
    assignedScores.set(next.id, scoreHabit(next, roleContext));
  }

  const extras = pickExtras(profile, anchors, context, week, guidance === 'hands_on').filter(
    (item) => !usedIds.has(item.habit.id),
  );
  for (const { habit: extra, slot } of extras) {
    const daypart = slot;
    assignedTimes.set(extra.id, daypart);
    assignedRoles.set(extra.id, `extra:${slot}`);
    assignedScores.set(extra.id, scoreHabit(extra, { ...context, daypart: slot }));
  }

  const skills = pickSkills(context, week);
  const standing = [...anchors, ...extras.map((item) => item.habit)];

  return {
    habits: standing.map((habit) =>
      toAssigned(habit, input.age, {
        foundation: FOUNDATION_ROLES.has(assignedRoles.get(habit.id) ?? ''),
        time: assignedTimes.get(habit.id),
        role: assignedRoles.get(habit.id),
        score: assignedScores.get(habit.id),
      }),
    ),
    profile: profile.map((habit) =>
      toAssigned(habit, input.age, {
        time: inferDaypart(habit),
        score: scoreHabit(habit, context),
      }),
    ),
    anchors: anchors.map((habit) =>
      toAssigned(habit, input.age, {
        foundation: FOUNDATION_ROLES.has(assignedRoles.get(habit.id) ?? ''),
        time: assignedTimes.get(habit.id),
        role: assignedRoles.get(habit.id),
        score: assignedScores.get(habit.id),
      }),
    ),
    skills: skills.map((habit) =>
      toAssigned(habit, input.age, {
        foundation: false,
        score: scoreHabit(habit, context),
      }),
    ),
  };
}

export function catalogHabit(id: string) {
  return catalogById.get(id);
}

export type CatalogInspection = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  ageGroups: string[];
  defaultTime: HabitTime;
  tags: string[];
  goalTags: string[];
  recommendedWhen: string[];
  cluster?: string;
  target: HabitTarget;
  frequency: HabitFrequency;
  priority: HabitPriority;
  habitType: HabitKind;
  prompts?: string[];
  opportunity: boolean;
  ageEligible: boolean;
  inProfilePool: boolean;
  inSkillPool: boolean;
  nearbyFallback: boolean;
  score: number;
  matchedGoals: GoalId[];
  matchedSignals: string[];
  rejectReasons: string[];
};

export function inspectCatalog(input: {
  age: number;
  goals: GoalId[];
  signals?: Iterable<string>;
  date?: Date;
}): CatalogInspection[] {
  const signals = new Set(input.signals ?? []);
  const context: ScoreContext = { age: input.age, goals: [...new Set(input.goals)].slice(0, 3), signals, date: input.date ?? new Date() };
  const band = catalogAgeGroup(input.age);

  return catalog.map((habit) => {
    const rejectReasons: string[] = [];
    if (!allowedGender(habit)) rejectReasons.push('Gender is not both');
    if (!habit.ageGroups.includes(band)) rejectReasons.push(`Age groups skip ${band}`);
    if (input.age < 13 && isTeenOnly(habit)) rejectReasons.push('Teen-only under 13');
    if (input.age < 9 && habit.category === 'puberty') rejectReasons.push('Puberty category under 9');
    if (isOpportunity(habit)) rejectReasons.push('Opportunity — used for skills, not the daily profile');
    if (habit.category === 'safety') rejectReasons.push('Safety is left out of daily routines');
    if (habit.category === 'puberty' && input.age >= 9) rejectReasons.push('Puberty is left out of daily routines');

    const strict = allowedForAge(habit, input.age);
    if (!strict) rejectReasons.push(`Outside supported ages (${habit.minAge ?? 2}–${habit.maxAge ?? 18})`);
    for (const signal of missingContext(habit, context)) rejectReasons.push(`Requires confirmed context: ${signal}`);
    if (!relevant(habit, context)) rejectReasons.push('No selected goal or concern matches');
    if (!isOpportunity(habit) && !isHabitDue(habit as AssignedHabit, context.date)) rejectReasons.push('Not scheduled for the selected date');

    return {
      id: habit.id,
      ...resolveCopy(habit, input.age),
      category: habit.category,
      ageGroups: habit.ageGroups,
      defaultTime: normalizeTime(habit.defaultTime),
      tags: habit.tags ?? [],
      goalTags: habit.goalTags ?? [],
      recommendedWhen: habit.recommendedWhen ?? [],
      cluster: habit.cluster,
      target: habit.target ?? 'parent',
      frequency: habitFrequency(habit),
      priority: habitPriority(habit),
      habitType: habit.habitType ?? 'routine',
      prompts: habit.prompts,
      opportunity: isOpportunity(habit),
      ageEligible: strict,
      inProfilePool: context.goals.length > 0 && profileCandidate(habit, context),
      inSkillPool: context.goals.length > 0 && eligible(habit, context) && relevant(habit, context) && isOpportunity(habit),
      nearbyFallback: false,
      score: scoreHabit(habit, context),
      matchedGoals: matchingGoals(habit, input.goals),
      matchedSignals: [...new Set([...(habit.recommendedWhen ?? []), ...(habit.tags ?? []), ...concernMatches(habit.id, signals)])]
        .filter((signal) => signals.has(signal)),
      rejectReasons,
    };
  });
}
