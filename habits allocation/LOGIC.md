# Habit allocation sandbox

This folder is a copy of the app’s habit-allocation code. Edit it here. The live app still uses `src/features/onboarding/` and `content/daily-habits.json`. Nothing in this folder is imported by the app, and `tsconfig.json` excludes it so Expo typecheck does not compile it.

A later Next.js playground can import these files, feed mock children through onboarding answers, and print the habits each child gets. No UI lives here yet.

## Files

| File | Role |
| --- | --- |
| `daily-habits.json` | Catalog. Every habit the allocator can pick. |
| `habit-signals.ts` | Turns onboarding answers into signal strings. |
| `assign-habits.ts` | Picks the profile, daily anchors, extras, and skills. |
| `plan.ts` | Onboarding draft → one plan per child. Calls the two files above. |
| `types.ts` | Draft, goals, guidance, marks, and assigned-habit types. |
| `content.ts` | Goal, pain, niche, and help copy that `plan.ts` wraps around the habits. |
| `copy.ts` | Child name and age phrasing used by `plan.ts`. |

## How a child becomes a habit list

1. Onboarding stores a `Draft`: children (name, age, optional per-child concerns), family goals, pain, niche, guidance, and habit marks.
2. `buildPlan` in `plan.ts` walks each child with an age.
3. Goals come from that child’s concerns when present, otherwise from the family goals.
4. Guidance is the child’s level, otherwise the family level. Missing guidance becomes `balanced`.
5. `profileSignals` builds a set of strings from the primary goal, the pain id, and the niche id. Examples: `bedtime_resistance`, `picky_eating`, `adhd`.
6. `assignHabits` receives `{ age, goals, signals, guidance, marks, childKey }`.

Empty goals return an empty assignment.

## What `assignHabits` returns

- `profile` — the child’s eligible pool, about 20 to 35 catalog habits.
- `anchors` — the standing daily habits, one per role.
- `habits` — anchors plus extras. This is the daily list.
- `skills` — up to 3 opportunity habits, rotated by ISO week.

## Selection rules

Age bands in the catalog are `2-4y`, `5-8y`, `9-12y`, and `13-18y`. A habit must list the child’s band (or `0-1y` only when the age allows it).

The profile is filled by score, then trimmed to at most 35:

- Goal match uses `GOAL_CATEGORIES` and `GOAL_TAGS`. The first goal weighs 100, the second 80, the third 65.
- Signals match `recommendedWhen` and `tags` on the catalog habit.
- Focus goals also boost `adhd` and `executive_function` tags.

Guidance sets how many roles are filled:

| Level | Roles per daypart | Daily shape |
| --- | --- | --- |
| `light` | 2 | 6 anchors |
| `balanced` | 3 | 9 anchors |
| `hands_on` | 3, plus one extra per daypart | 9 anchors and up to 3 extras |

Roles and dayparts:

- Morning: `morning_health`, `morning_independence`, `morning_goal`
- Afternoon: `afternoon_regulation`, `afternoon_movement`, `afternoon_skill`
- Evening: `evening_family`, `evening_prep`, `evening_connection`

`light` keeps the first and last role in each daypart. Each role prefers catalog categories listed in `ROLE_CATEGORIES`. Scoring also spreads clusters, categories, and parent vs child targets so one cluster does not take the whole day. A habit already marked often enough for that child is skipped (`isHabitGraduated`). If the profile has no match, the allocator falls back to the wider catalog.

Skills are catalog habits flagged as opportunities, ranked with the same score, then rotated by week so the same three do not stick forever.

## Mock children

When the Next.js runner exists, a fixture only needs what `buildPlan` reads:

```ts
const draft = {
  audience: 'child',
  children: [
    {
      id: 'maya',
      name: 'Maya',
      age: 7,
      concerns: {
        goals: ['sleep', 'behaviour'],
        painId: 'long',
        intensity: 'daily',
        helpStyles: ['routines'],
        nicheId: 'wired',
        guidance: 'balanced',
      },
    },
  ],
  goals: ['sleep'],
  painId: null,
  intensity: null,
  helpStyles: [],
  nicheId: null,
  guidance: 'balanced',
  habitMarks: {},
};
```

`buildPlan(draft)` returns `children[].habits`, `.anchors`, `.skills`, and `.profile`. To test the allocator alone, call `assignHabits` with age, goals, `profileSignals(...)`, guidance, marks, and a stable `childKey`.

Change `date` on `assignHabits` to move the ISO week and see skill and extra rotation.
