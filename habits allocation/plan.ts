import {
  assignHabits,
  habitFrequencyLabel,
  habitTimeEmoji,
  habitTimeLabel,
  resolveGuidance,
  todaysPrompt,
} from './assign-habits';
import {
  ageBand,
  fill,
  getGoal,
  helpOption,
  skillKicker,
  type GoalContent,
  type NicheOption,
} from './content';
import { completedChildren, formatAgeLine, formatChildLabel } from './copy';
import { profileSignals } from './habit-signals';
import type { AgeBand, ChildDraft, ChildPlan, Draft, FamilyPlan, GuidanceLevel, HelpStyle, Intensity, PlanBlock } from './types';

function emphasisFor(help: HelpStyle): PlanBlock['id'] | 'skill' {
  switch (help) {
    case 'what_to_do':
      return 'evening';
    case 'what_to_say':
      return 'skill';
    case 'together':
      return 'afternoon';
    case 'routines':
      return 'morning';
    case 'why':
      return 'skill';
  }
}

function skillTitle(template: string, label: string, count: number) {
  const text = fill(template, label);
  if (count < 2) return text;
  const swaps: [string, string][] = [
    [' leaves ', ' leave '],
    [' asks ', ' ask '],
    [' ignores ', ' ignore '],
    [' handles ', ' handle '],
    [' goes ', ' go '],
    [' talks ', ' talk '],
    [' settles ', ' settle '],
    [' messes ', ' mess '],
    [' needs ', ' need '],
    [' feels ', ' feel '],
    [' freezes ', ' freeze '],
    [' is ', ' are '],
    [" doesn't ", " don't "],
    [" isn't ", " aren't "],
  ];
  return swaps.reduce((line, [from, to]) => line.replace(from, to), text);
}

function skillDetail(help: HelpStyle, niche: NicheOption, name: string) {
  switch (help) {
    case 'what_to_do':
      return 'Three clear steps for the moment';
    case 'what_to_say':
      return fill(niche.parentLine, name);
    case 'together':
      return 'Do this side by side';
    case 'routines':
      return 'Same time, same order';
    case 'why':
      return 'A short why, then one move';
  }
}

function firstTask(goal: GoalContent, band: AgeBand, help: HelpStyle, niche: NicheOption, name: string) {
  const mins = band === 'little' ? '2 min' : '5 min';
  switch (help) {
    case 'what_to_say':
      return {
        emoji: '💬',
        title: 'Say one true sentence',
        detail: fill(niche.parentLine, name),
        meta: `${mins} · Words`,
      };
    case 'together':
      return {
        emoji: '❤️',
        title: band === 'little' ? '2-minute connection' : '5-minute connection',
        detail: fill(goal.connectionPrompt, name),
        meta: `${mins} · Connection`,
      };
    case 'routines':
      return {
        emoji: '🔁',
        title: 'Name the routine',
        detail: `Tell ${name} that ${goal.routineAnchor} starts today, and keep the order the same.`,
        meta: `${mins} · Routine`,
      };
    case 'why':
      return {
        emoji: '📘',
        title: 'Remember one why',
        detail: fill(goal.why, name),
        meta: '1 min · Why',
      };
    case 'what_to_do':
      return {
        emoji: '🧭',
        title: 'One small move',
        detail: fill(goal.tinyStep[band], name),
        meta: `${mins} · Today`,
      };
  }
}

function parentHabit(intensity: Intensity, name: string) {
  switch (intensity) {
    case 'daily':
      return {
        emoji: '🌬️',
        title: 'Before you step in',
        detail: `One breath, then the first sentence for ${name}.`,
      };
    case 'weekly':
      return {
        emoji: '🗓️',
        title: 'Pick your window',
        detail: `Choose the one part of the day you'll practice with ${name}.`,
      };
    case 'occasionally':
      return {
        emoji: '🃏',
        title: 'A line you can keep',
        detail: `Save the sentence you'll use the next time it happens with ${name}.`,
      };
    case 'prevent':
      return {
        emoji: '🌿',
        title: 'Set the tone early',
        detail: `A two-minute check-in with yourself before ${name}'s tricky moment.`,
      };
  }
}

export function buildPlan(draft: Draft): FamilyPlan | null {
  const children = completedChildren(draft.children);
  const primaryId = draft.goals[0];
  if (
    !draft.audience ||
    !primaryId ||
    !draft.painId ||
    !draft.intensity ||
    !draft.nicheId ||
    draft.helpStyles.length === 0 ||
    children.length === 0
  ) {
    return null;
  }

  const goal = getGoal(primaryId);
  const pain = goal.pains.find((item) => item.id === draft.painId) ?? goal.pains[0];
  const niche = goal.niches.find((item) => item.id === draft.nicheId) ?? goal.niches[0];
  if (!pain || !niche) return null;

  const ages = children.flatMap((child) => (child.age == null ? [] : [child.age]));
  const focusAge = Math.min(...ages);
  const band = ageBand(focusAge);
  const routine = goal.routines[band];
  const childLabel = formatChildLabel(children);
  const help = draft.helpStyles[0];
  if (!help) return null;
  const emphasis = emphasisFor(help);
  const extraGoals = draft.goals.slice(1).map((id) => getGoal(id).title);

  const blocks: PlanBlock[] = [
    {
      id: 'morning',
      period: 'Morning',
      emoji: '🌞',
      title: routine.morning,
      emphasized: emphasis === 'morning',
    },
    {
      id: 'afternoon',
      period: 'Afternoon',
      emoji: '🍎',
      title: routine.afternoon,
      emphasized: emphasis === 'afternoon',
    },
    {
      id: 'evening',
      period: 'Evening',
      emoji: goal.emoji,
      title: pain.evening,
      emphasized: emphasis === 'evening',
    },
  ];

  const helpMeta = helpOption(help);
  const baseScenarios = ['Tantrum', "Won't sleep", 'Sibling fight', 'Homework meltdown'];
  const helpNow = [goal.hotScenario, ...baseScenarios.filter((item) => item !== goal.hotScenario)].slice(0, 5);
  const guidance = resolveGuidance(draft.guidance);
  const childPlans: ChildPlan[] = children.flatMap((child) => {
    if (child.age == null) return [];
    const childGoals =
      child.concerns && child.concerns.goals.length > 0 ? child.concerns.goals : draft.goals;
    const childGuidance = resolveGuidance(child.concerns?.guidance ?? draft.guidance);
    const signals = profileSignals({
      goals: childGoals,
      painId: child.concerns?.painId ?? draft.painId,
      nicheId: child.concerns?.nicheId ?? draft.nicheId,
    });
    const childKey = child.id ?? child.name.trim();
    const assignment = assignHabits({
      age: child.age,
      goals: childGoals,
      signals,
      guidance: childGuidance,
      marks: draft.habitMarks,
      childKey,
    });
    return [
      {
        name: child.name.trim(),
        age: child.age,
        ...assignment,
      },
    ];
  });
  const starter =
    childPlans[0]?.anchors.find((habit) => habit.defaultTime === 'Morning') ?? childPlans[0]?.anchors[0];

  return {
    childLabel,
    parentName: draft.parentName.trim(),
    childKey: children[0]?.id ?? children[0]?.name ?? 'child',
    guidance,
    goals: draft.goals,
    habitMarks: draft.habitMarks,
    blocks,
    children: childPlans,
    skill: {
      label: skillKicker(draft.intensity),
      title: skillTitle(niche.skill, childLabel, children.length),
      detail: skillDetail(help, niche, childLabel),
      emphasized: emphasis === 'skill',
    },
    weeklyGoal: fill(pain.weekly, childLabel),
    builtAround: [formatAgeLine(ages), goal.title, ...extraGoals, helpMeta.short],
    firstTask: starter
      ? {
          emoji: habitTimeEmoji(starter.defaultTime),
          title: starter.title,
          detail: (starter.prompts && todaysPrompt(starter.prompts)) || starter.description,
          meta: `${habitTimeLabel(starter.defaultTime)} · ${habitFrequencyLabel(starter.frequency)}`,
        }
      : firstTask(goal, band, help, niche, childLabel),
    parentHabit: draft.audience === 'family' ? parentHabit(draft.intensity, childLabel) : null,
    sayScript: {
      childLine: fill(niche.childLine, childLabel),
      parentLine: fill(niche.parentLine, childLabel),
    },
    helpNow,
    priorityTitle: goal.title,
    priorityDetail: extraGoals.length > 0 ? `Also ${extraGoals.join(' · ')}` : '',
    challengeTitle: pain.label,
    wantTitle: helpMeta.want,
    wantDetail: draft.helpStyles
      .slice(1)
      .map((id) => helpOption(id).short)
      .join(' · '),
    ageLine: formatAgeLine(ages),
    focusAge,
  };
}

export function planForChild(draft: Draft, child: ChildDraft): FamilyPlan | null {
  if (child.age == null || child.name.trim().length === 0) return null;
  const concerns = child.concerns;
  const own =
    concerns != null &&
    concerns.goals.length > 0 &&
    concerns.painId != null &&
    concerns.intensity != null &&
    concerns.nicheId != null &&
    concerns.helpStyles.length > 0;

  return buildPlan({
    ...draft,
    audience: draft.audience === 'family' ? 'family' : 'child',
    children: [child],
    goals: own && concerns ? concerns.goals : draft.goals,
    painId: own && concerns ? concerns.painId : draft.painId,
    intensity: own && concerns ? concerns.intensity : draft.intensity,
    helpStyles: own && concerns ? concerns.helpStyles : draft.helpStyles,
    nicheId: own && concerns ? concerns.nicheId : draft.nicheId,
    guidance: (own && concerns?.guidance ? concerns.guidance : draft.guidance) as GuidanceLevel | null,
  });
}
