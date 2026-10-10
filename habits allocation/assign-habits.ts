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

const AGE_BANDS = ['0-1y', '2-4y', '5-8y', '9-12y', '13-18y'] as const;
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

const FOCUS_TAGS = new Set(['adhd', 'executive_function']);
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
const PROFILE_MIN = 20;
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
  activeMonths?: number[];
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

function resolveDescription(habit: CatalogHabit, age: number) {
  const band = catalogAgeGroup(age);
  return habit.variants?.[band] ?? habit.description;
}

function toAssigned(
  habit: CatalogHabit,
  age: number,
  extras?: { foundation?: boolean; time?: HabitTime; role?: string; score?: number },
): AssignedHabit {
  return {
    id: habit.id,
    title: habit.title,
    subtitle: habit.subtitle,
    description: resolveDescription(habit, age),
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

function ageDistance(age: number, groups: string[]) {
  const target = AGE_BANDS.indexOf(catalogAgeGroup(age) as (typeof AGE_BANDS)[number]);
  const distances = groups.flatMap((group) => {
    const index = AGE_BANDS.indexOf(group as (typeof AGE_BANDS)[number]);
    return index < 0 || target < 0 ? [] : [Math.abs(index - target)];
  });
  return distances.length > 0 ? Math.min(...distances) : 99;
}

function isTeenOnly(habit: CatalogHabit) {
  return (habit.tags ?? []).includes('teen') || habit.ageGroups.every((group) => group === '13-18y');
}

function allowedForAge(habit: CatalogHabit, age: number, strict = true) {
  if (!allowedGender(habit)) return false;
  const band = catalogAgeGroup(age);
  if (strict && !habit.ageGroups.includes(band)) return false;
  if (!strict && ageDistance(age, habit.ageGroups) > 1) return false;
  if (age < 13 && isTeenOnly(habit)) return false;
  if (age < 9 && habit.category === 'puberty') return false;
  return true;
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
  daypart?: Daypart;
  usedClusters?: Set<string>;
  categoryCounts?: Map<string, number>;
  targetCounts?: Map<string, number>;
};

export function scoreHabit(habit: CatalogHabit, context: ScoreContext) {
  const matched = matchingGoals(habit, context.goals);
  let score = 0;
  for (const goal of matched) {
    const index = context.goals.indexOf(goal);
    if (index >= 0 && index < GOAL_WEIGHTS.length) score += GOAL_WEIGHTS[index] ?? 0;
  }
  if (matched.length >= 2) score += 25;
  if (habit.ageGroups.includes(catalogAgeGroup(context.age))) score += 35;
  score += 20 * (habit.recommendedWhen ?? []).filter((signal) => context.signals.has(signal)).length;
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
  const eligible = pool.filter(
    (habit) => !usedIds.has(habit.id) && fitsRole(habit, role, context.goals) && preferredForRole(habit, role),
  );
  const ranked = [...eligible].sort((left, right) => compareScored(left, right, roleContext));
  return ranked[0];
}

function withFallback(
  role: string,
  age: number,
  context: ScoreContext,
  usedIds: Set<string>,
) {
  const strict = catalog.filter((habit) => allowedForAge(habit, age, true) && isRoutineCandidate(habit));
  const picked = pickForRole(role, strict, context, usedIds);
  if (picked) return picked;
  const nearby = catalog.filter((habit) => allowedForAge(habit, age, false) && isRoutineCandidate(habit));
  return pickForRole(role, nearby, context, usedIds);
}

function buildProfile(age: number, context: ScoreContext) {
  const eligible = catalog.filter((habit) => allowedForAge(habit, age, true) && isRoutineCandidate(habit));
  const ranked = [...eligible].sort((left, right) => compareScored(left, right, context));
  const selected: CatalogHabit[] = [];
  const used = new Set<string>();

  for (const daypart of DAYPARTS) {
    const local = { ...context, daypart };
    const fromPart = ranked
      .filter((habit) => {
        const time = normalizeTime(habit.defaultTime);
        return time === daypart || time === 'All day';
      })
      .sort((left, right) => compareScored(left, right, local));
    for (const habit of fromPart.slice(0, 6)) {
      if (used.has(habit.id)) continue;
      used.add(habit.id);
      selected.push(habit);
    }
  }

  for (const habit of ranked) {
    if (selected.length >= PROFILE_MAX) break;
    if (used.has(habit.id)) continue;
    used.add(habit.id);
    selected.push(habit);
  }

  if (selected.length < PROFILE_MIN) {
    for (const habit of eligible) {
      if (selected.length >= PROFILE_MIN) break;
      if (used.has(habit.id)) continue;
      used.add(habit.id);
      selected.push(habit);
    }
  }

  return selected.slice(0, PROFILE_MAX);
}

function rolesFor(guidance: GuidanceLevel): readonly string[] {
  const table = guidance === 'light' ? ANCHOR_ROLES.light : ANCHOR_ROLES.balanced;
  return DAYPARTS.flatMap((daypart) => table[daypart]);
}

function pickSkills(age: number, context: ScoreContext, week: number) {
  const candidates = catalog.filter((habit) => allowedForAge(habit, age, true) && isOpportunity(habit));
  const ranked = [...candidates].sort((left, right) => compareScored(left, right, context));
  if (ranked.length === 0) return [];
  const start = week % ranked.length;
  const rotated = [...ranked.slice(start), ...ranked.slice(0, start)];
  return rotated.slice(0, SKILL_COUNT);
}

function pickExtras(
  profile: CatalogHabit[],
  anchors: CatalogHabit[],
  context: ScoreContext,
  week: number,
  include: boolean,
) {
  if (!include) {
    return DAYPARTS.flatMap((daypart) => {
      const pool = profile.filter((habit) => {
        if (anchors.some((anchor) => anchor.id === habit.id)) return false;
        const time = normalizeTime(habit.defaultTime);
        return time === daypart || time === 'All day';
      });
      if (pool.length === 0) return [];
      const extra = pool[(week + habitHash(daypart)) % pool.length];
      return extra ? [{ habit: extra, slot: daypart }] : [];
    });
  }

  return DAYPARTS.flatMap((daypart) => {
    const local = { ...context, daypart };
    const pool = profile
      .filter((habit) => {
        if (anchors.some((anchor) => anchor.id === habit.id)) return false;
        const time = normalizeTime(habit.defaultTime);
        return time === daypart || time === 'All day';
      })
      .sort((left, right) => compareScored(left, right, local));
    const extra = pool[(week + habitHash(daypart)) % Math.max(pool.length, 1)];
    return extra ? [{ habit: extra, slot: daypart }] : [];
  });
}

export function assignHabits(input: AssignHabitsInput): HabitAssignment {
  if (input.goals.length === 0) {
    return { habits: [], profile: [], anchors: [], skills: [] };
  }

  const guidance = resolveGuidance(input.guidance);
  const date = input.date ?? new Date();
  const week = isoWeek(date);
  const signals = new Set(input.signals ?? []);
  const context: ScoreContext = {
    age: input.age,
    goals: input.goals,
    signals,
  };

  const profile = buildProfile(input.age, context);
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

    const pool = profile.filter((habit) => !isHabitGraduated(input.marks, input.childKey, habit.id));
    let next = pickForRole(role, pool, roleContext, usedIds);
    if (!next) next = withFallback(role, input.age, roleContext, usedIds);
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
    const time = normalizeTime(extra.defaultTime);
    const daypart = time === 'Morning' || time === 'Afternoon' || time === 'Evening' ? time : 'Evening';
    assignedTimes.set(extra.id, daypart);
    assignedRoles.set(extra.id, `extra:${slot}`);
    assignedScores.set(extra.id, scoreHabit(extra, { ...context, daypart: slot }));
  }

  const skills = pickSkills(input.age, context, week);
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
}): CatalogInspection[] {
  const signals = new Set(input.signals ?? []);
  const context: ScoreContext = { age: input.age, goals: input.goals, signals };
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

    const strict = allowedForAge(habit, input.age, true);
    const routine = isRoutineCandidate(habit);

    return {
      id: habit.id,
      title: habit.title,
      subtitle: habit.subtitle,
      description: resolveDescription(habit, input.age),
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
      inProfilePool: strict && routine,
      nearbyFallback: !strict && allowedForAge(habit, input.age, false) && routine,
      score: scoreHabit(habit, context),
      matchedGoals: matchingGoals(habit, input.goals),
      matchedSignals: (habit.recommendedWhen ?? []).filter((signal) => signals.has(signal)),
      rejectReasons,
    };
  });
}
