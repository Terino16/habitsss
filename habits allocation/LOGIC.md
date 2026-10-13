# Habit recommendations

This folder is imported by the Next.js simulator in `app/simulator/`. `plan.ts` is the draft-to-plan adapter; `app/simulator/model.ts` drives the simulator with an explicit date.

## Selection order

1. Validate age (whole years, 2–18) and take up to three unique, ordered goals. Empty goals produce no plan.
2. Check the catalog age band, optional exact `minAge`/`maxAge`, and every `requiredSignals` condition. These are hard requirements in profiles, daily habits, skills and fallback selection. Unknown context does not satisfy a requirement.
3. Rank relevant routines and a small set of general daily foundations. Keep at most 35 in the profile, without a minimum-fill requirement.
4. Fill daypart roles from habits due on the selected date. Apply ID/title uniqueness and cluster limits across the day. A fallback can widen the pool but cannot relax eligibility or scheduling.
5. Only hands-on guidance adds extras. Choose extras sequentially so an all-day habit cannot appear in multiple slots, and retain its selected daypart.
6. Offer up to three contextual skills separately. Keep the highest-ranked concern-specific skill visible, then rotate remaining peers among the top eight candidates within 20 points of the best score using week and child key.

## Goals and context

The first three goals have weights 100, 80 and 65. A habit matches through its category, goal tags, or relevant focus-support tags. Additional scoring rewards matching explicit concerns, foundation priority and time fit. Diversity penalties spread categories and parent/child targets; cluster caps are hard limits (normally one per day, two movement items for focus plans).

`concern-relevance.ts` maps every displayed pain and niche to ordered IDs in the current catalog. `profileSignals` preserves the exact choices as `pain:<goal>:<answer>` and `niche:<goal>:<answer>`, alongside broad signals. A direct pain match adds 220/200/180/160 points in mapping order; a niche match adds 70/60/50/40. This makes direct concerns stronger than generic goal relevance without forcing different habits for equivalent needs. Unrecognised answers get no specific bonus.

Direct matches are relevant even across category boundaries and can fill non-foundation roles in their existing daypart. Before selection, reserve cluster capacity for the stronger concern match so an earlier generic choice cannot crowd it out. All original age, context, due-date and completion checks still apply. Event-based practices remain in skills; they are not artificially scheduled as daily habits. The morning checklist is scheduled in the morning. Catalog inspection and the simulator show the matched pain label.

Some related answers legitimately share suggestions; limited age-appropriate catalog coverage can also yield overlap. Changing a family answer does not override a child with “Own answers” enabled.

Goals do not establish diagnoses or specific difficulties. Pain/niche answers generate concern signals; focus difficulties use `attention_difficulty`, not an inferred ADHD diagnosis.

`profileSignals` also accepts `contextSignals`, restricted to the exported `CONTEXT_OPTIONS`. These can be supplied programmatically; the simulator does not ask a separate context question. Supported facts include siblings, bedwetting support, bullying others, period preparation, an upcoming teacher meeting, choosing a phone plan, and creating an online account. A sibling concern also supplies the sibling signal. The number of profiles alone is not used to infer family structure. `ChildDraft.contextSignals` supplies the same facts to `buildPlan`.

Catalog `recommendedWhen` and `tags` increase relevance; they are not hard requirements. `requiredSignals` is a separate, explicit list whose entries must all match. General one-to-one connection time does not require siblings.

## Frequency and history

`daily` is eligible each day; `few_times_week`, `weekly`, `monthly`, and `seasonal` use `isHabitDue`. Opportunity/event-based items belong in skills, not scheduled daily routines. Skills are suggestions to use when the named situation arises, not proof that an event has happened.

Ongoing routines remain available after repeated completion. The earlier rule retiring everything after 14 successes is no longer used in selection. Completed `one_time_learning` items are excluded using the current child's dated marks; future marks do not suppress historical plans.

Guidance limits are upper bounds:

| Guidance | Morning | Afternoon | Evening |
| --- | ---: | ---: | ---: |
| Light | 2 | 2 | 2 |
| Balanced | 3 | 3 | 3 |
| Hands-on | 4 | 4 | 4 |

Plans can be shorter when no suitable habit fits. Never fill a quota with an age-inappropriate, context-inappropriate, duplicate or off-schedule habit.

## Inspection and validation

`inspectCatalog` uses the same age, context and relevance rules and accepts the selected date. It exposes profile and skill eligibility plus rejection reasons; adjacent-age fallback is disabled. A profile is a candidate pool, so a profile member need not be due today.

Run `npm test` for UI-option mapping coverage, pain-sensitive recommendations, preserved weekly priority, and regression coverage across ages, goals, guidance levels, dates, confirmed context, uniqueness, cluster caps, history, and simulator input resolution. `npx tsc --noEmit` and `npm run lint` check integration. The tests use the existing TypeScript compiler in memory and Node's test runner; no additional test dependency is needed.

The catalog still contains qualitative metadata and broad age bands for practices without explicit source limits. This is a deterministic rules-based recommender, not a clinical assessment. Personal dislike, available time, and recurrence of triggering events are not yet collected.

## Age progression

`ageVersions` in the JSON supplies a complete title, subtitle and description for an inclusive age range. Twenty recurring practices have versions for 9–12, 13–15 and 16–18; younger children use the base copy. Both assignment and catalog inspection resolve the same version. These are editorial defaults based on published guidance about increasing independence, not clinical developmental milestones. Support should follow ability, not birthdays alone.

A progression keeps the underlying habit ID, history, pain matching, frequency and eligibility. It cannot bypass a required context or make a teen-only habit available to a younger child. The steps increase ownership or scope (for example recipe preparation to planning and cooking a meal), rather than inflating difficulty or repeating duplicate catalog entries. Essential care and parent behaviours without a meaningful progression remain the same. Each version records its guidance URLs.
