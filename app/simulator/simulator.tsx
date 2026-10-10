"use client";

import { useMemo, useState } from "react";
import {
  dailyQuota,
  habitFrequencyLabel,
  habitTimeEmoji,
  todaysPrompt,
  type CatalogInspection,
} from "../../habits allocation/assign-habits";
import {
  GUIDANCE_OPTIONS,
  getGoal,
  listGoals,
} from "../../habits allocation/content";
import type {
  AssignedHabit,
  GoalId,
  GuidanceLevel,
  HabitTime,
} from "../../habits allocation/types";
import {
  runChild,
  simulationDate,
  type ChildInput,
  type ChildSimulation,
  type FamilyInput,
} from "./model";

const GOAL_WEIGHTS = [100, 80, 65];
const DAYPARTS: HabitTime[] = ["Morning", "Afternoon", "Evening"];

const DAYPART_TONE: Record<string, { wash: string; ink: string; line: string }> = {
  Morning: { wash: "bg-[#fff6e4]", ink: "text-[#8a5a12]", line: "border-[#efd7a8]" },
  Afternoon: { wash: "bg-[#e8f7ef]", ink: "text-[#1b6842]", line: "border-[#b7e0cb]" },
  Evening: { wash: "bg-[#f3eefb]", ink: "text-[#543c8c]", line: "border-[#d5c9ef]" },
};

const ROLE_LABEL: Record<string, string> = {
  morning_health: "Health",
  morning_independence: "Independence",
  morning_goal: "Goal",
  afternoon_regulation: "Regulation",
  afternoon_movement: "Movement",
  afternoon_skill: "Skill",
  evening_family: "Family",
  evening_prep: "Prep",
  evening_connection: "Connection",
  extra: "Extra",
};

type View = "plan" | "compare" | "catalog";
type CatalogPool = "all" | "profile" | "skills" | "out";

const INITIAL_FAMILY: FamilyInput = {
  goals: ["sleep", "behaviour"],
  painId: "long",
  nicheId: "wired",
  guidance: "balanced",
  date: "2026-10-11",
};

function childDraft(
  partial: Pick<ChildInput, "key" | "name" | "age"> & Partial<ChildInput>,
): ChildInput {
  return {
    own: false,
    goals: ["sleep"],
    painId: "long",
    nicheId: "wired",
    guidance: "balanced",
    ...partial,
  };
}

const PRESETS: { id: string; label: string; family: FamilyInput; children: ChildInput[]; view: View }[] = [
  {
    id: "maya",
    label: "Maya, 7",
    family: INITIAL_FAMILY,
    view: "plan",
    children: [childDraft({ key: "maya", name: "Maya", age: 7 })],
  },
  {
    id: "toddler",
    label: "Toddler meals",
    family: {
      ...INITIAL_FAMILY,
      goals: ["eating"],
      painId: "refuses",
      nicheId: "under5",
      guidance: "light",
    },
    view: "plan",
    children: [childDraft({ key: "ava", name: "Ava", age: 3 })],
  },
  {
    id: "teen",
    label: "Teen focus",
    family: {
      ...INITIAL_FAMILY,
      goals: ["focus", "school"],
      painId: "homework",
      nicheId: "homework",
      guidance: "hands_on",
    },
    view: "plan",
    children: [childDraft({ key: "sam", name: "Sam", age: 16 })],
  },
  {
    id: "siblings",
    label: "Two siblings",
    family: INITIAL_FAMILY,
    view: "compare",
    children: [
      childDraft({ key: "maya", name: "Maya", age: 7 }),
      childDraft({
        key: "leo",
        name: "Leo",
        age: 12,
        own: true,
        goals: ["screens", "focus"],
        painId: "put-down",
        nicheId: "meltdown",
        guidance: "hands_on",
      }),
    ],
  },
];

function words(value: string) {
  return value.replaceAll("_", " ");
}

function isExtra(role?: string) {
  return role?.startsWith("extra") ?? false;
}

function roleLabel(role?: string) {
  if (!role) return "Habit";
  if (role.startsWith("extra:")) return `Extra · ${role.slice("extra:".length).toLowerCase()}`;
  return ROLE_LABEL[role] ?? words(role);
}

function syncConcerns<T extends { goals: GoalId[]; painId: string; nicheId: string }>(
  current: T,
  goals: GoalId[],
): T {
  const primary = goals[0];
  if (!primary) return { ...current, goals };
  const goal = getGoal(primary);
  const painId = goal.pains.some((pain) => pain.id === current.painId)
    ? current.painId
    : (goal.pains[0]?.id ?? current.painId);
  const nicheId = goal.niches.some((niche) => niche.id === current.nicheId)
    ? current.nicheId
    : (goal.niches[0]?.id ?? current.nicheId);
  return { ...current, goals, painId, nicheId };
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const next = index + direction;
  if (next < 0 || next >= items.length) return items;
  const copy = [...items];
  const [item] = copy.splice(index, 1);
  if (item === undefined) return items;
  copy.splice(next, 0, item);
  return copy;
}

function planJson(results: ChildSimulation[]) {
  return results.map((result) => ({
    name: result.name,
    age: result.age,
    band: result.band,
    goals: result.goals,
    guidance: result.guidance,
    signals: result.signals,
    week: result.week,
    anchors: result.assignment.anchors.map((habit) => ({
      role: habit.role,
      id: habit.id,
      title: habit.title,
      score: habit.score,
      category: habit.category,
      time: habit.defaultTime,
    })),
    extras: result.assignment.habits
      .filter((habit) => isExtra(habit.role))
      .map((habit) => ({
        id: habit.id,
        title: habit.title,
        score: habit.score,
        time: habit.defaultTime,
      })),
    skills: result.assignment.skills.map((habit) => ({
      id: habit.id,
      title: habit.title,
      score: habit.score,
    })),
  }));
}

export function Simulator() {
  const [family, setFamily] = useState<FamilyInput>(INITIAL_FAMILY);
  const [children, setChildren] = useState<ChildInput[]>([
    childDraft({ key: "maya", name: "Maya", age: 7 }),
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [view, setView] = useState<View>("plan");
  const [copied, setCopied] = useState(false);

  const safeIndex = Math.min(activeIndex, Math.max(children.length - 1, 0));
  const selected = children[safeIndex];

  const results = useMemo(
    () => children.map((child) => runChild(family, child)),
    [children, family],
  );
  const active = results[safeIndex];
  const when = simulationDate(family.date);

  function patchChild(index: number, patch: Partial<ChildInput>) {
    setChildren((current) =>
      current.map((child, childIndex) => (childIndex === index ? { ...child, ...patch } : child)),
    );
  }

  function patchSelected(patch: Partial<ChildInput>) {
    patchChild(safeIndex, patch);
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setFamily((current) => ({ ...preset.family, date: current.date }));
    setChildren(preset.children);
    setActiveIndex(0);
    setView(preset.view);
  }

  function spreadAges() {
    const names: [string, number][] = [
      ["Ava", 3],
      ["Noah", 7],
      ["Priya", 11],
      ["Sam", 16],
    ];
    setChildren(
      names.map(([name, age]) =>
        childDraft({
          key: name.toLowerCase(),
          name,
          age,
          goals: family.goals,
          painId: family.painId,
          nicheId: family.nicheId,
          guidance: family.guidance,
        }),
      ),
    );
    setActiveIndex(0);
    setView("compare");
  }

  async function copyPlans() {
    await navigator.clipboard.writeText(JSON.stringify(planJson(results), null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="min-h-screen bg-[#f3efe6] text-[#231e1a] font-sans">
      <div className="mx-auto grid max-w-[1440px] min-[1000px]:grid-cols-[23rem_minmax(0,1fr)]">
        <aside className="border-b border-[#e4dccb] bg-[#f7f4ee] min-[1000px]:sticky min-[1000px]:top-0 min-[1000px]:max-h-screen min-[1000px]:overflow-y-auto min-[1000px]:border-r min-[1000px]:border-b-0">
          <div className="flex flex-col gap-8 px-5 py-6">
            <header>
              <p className="text-xs font-medium tracking-[0.16em] text-[#8a7560] uppercase">
                Sandbox
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Habit allocation</h1>
              <p className="mt-2 text-sm leading-6 text-[#5c5148]">
                Runs <code className="font-mono text-[0.85em]">assignHabits</code> the same way a
                plan does. Change a child, the answers, or the date and the list updates.
              </p>
            </header>

            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-medium tracking-[0.14em] text-[#8a7560] uppercase">
                Start from
              </h2>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-full border border-[#ddd3c3] bg-white px-3 py-1 text-sm text-[#3f342c] hover:border-[#1f6f66]"
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={spreadAges}
                  className="rounded-full border border-[#1f6f66] bg-[#1f6f66] px-3 py-1 text-sm text-white"
                >
                  Four age bands
                </button>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-medium tracking-[0.14em] text-[#8a7560] uppercase">
                  Children
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const key = `child-${children.length + 1}-${Date.now().toString(36)}`;
                    setChildren((current) => [
                      ...current,
                      childDraft({ key, name: "New child", age: 8 }),
                    ]);
                    setActiveIndex(children.length);
                  }}
                  className="text-sm font-medium text-[#1f6f66]"
                >
                  Add child
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {children.map((child, index) => {
                  const result = results[index];
                  const on = index === safeIndex;
                  return (
                    <button
                      key={child.key}
                      type="button"
                      onClick={() => {
                        setActiveIndex(index);
                        if (view === "catalog") return;
                        setView("plan");
                      }}
                      className={`rounded-xl border px-3 py-2 text-left ${
                        on ? "border-[#1f6f66] bg-white" : "border-[#e4dccb] bg-[#fbfaf7]"
                      }`}
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-medium">{child.name.trim() || "Unnamed"}</span>
                        <span className="font-mono text-xs text-[#6d6258]">
                          {child.age} · {result?.band}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs text-[#6d6258]">
                        {child.own ? "Own answers" : "Family answers"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {selected ? (
              <ChildEditor
                child={selected}
                canRemove={children.length > 1}
                onChange={patchSelected}
                onOwn={(own) => {
                  if (!own) {
                    patchSelected({ own: false });
                    return;
                  }
                  patchSelected({
                    own: true,
                    goals: family.goals,
                    painId: family.painId,
                    nicheId: family.nicheId,
                    guidance: family.guidance,
                  });
                }}
                onRemove={() => {
                  setChildren((current) => current.filter((_, index) => index !== safeIndex));
                  setActiveIndex((index) => Math.max(0, index - 1));
                }}
              />
            ) : null}

            <section className="flex flex-col gap-4 border-t border-[#e4dccb] pt-6">
              <div>
                <h2 className="text-xs font-medium tracking-[0.14em] text-[#8a7560] uppercase">
                  Family answers
                </h2>
                <p className="mt-1 text-sm leading-5 text-[#6d6258]">
                  Used for every child who is not on their own answers.
                </p>
              </div>
              <ConcernFields
                goals={family.goals}
                painId={family.painId}
                nicheId={family.nicheId}
                guidance={family.guidance}
                onGoals={(goals) => setFamily((current) => syncConcerns(current, goals))}
                onPain={(painId) => setFamily((current) => ({ ...current, painId }))}
                onNiche={(nicheId) => setFamily((current) => ({ ...current, nicheId }))}
                onGuidance={(guidance) => setFamily((current) => ({ ...current, guidance }))}
              />
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Date</span>
                <input
                  type="date"
                  value={family.date}
                  onChange={(event) =>
                    setFamily((current) => ({ ...current, date: event.target.value }))
                  }
                  className="rounded-lg border border-[#ddd3c3] bg-white px-3 py-2"
                />
                <span className="text-xs text-[#6d6258]">
                  Skills and extras rotate on the ISO week of this date
                  {active ? ` · week ${active.week}` : ""}.
                </span>
              </label>
            </section>
          </div>
        </aside>

        <main className="min-w-0 px-5 py-6 sm:px-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-full bg-[#e7e0d4] p-1">
              {(
                [
                  ["plan", "Plan"],
                  ["compare", "Compare"],
                  ["catalog", "Catalog"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setView(id)}
                  className={`rounded-full px-4 py-1.5 text-sm ${
                    view === id ? "bg-white font-medium text-[#231e1a]" : "text-[#5c5148]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                void copyPlans();
              }}
              className="rounded-full border border-[#ddd3c3] bg-white px-3 py-1.5 text-sm"
            >
              {copied ? "Copied" : "Copy plans"}
            </button>
          </div>

          {view === "plan" && active ? (
            <PlanView result={active} when={when} />
          ) : null}

          {view === "compare" ? <CompareView results={results} onOpen={(index) => {
            setActiveIndex(index);
            setView("plan");
          }} /> : null}

          {view === "catalog" && active ? <CatalogView result={active} when={when} /> : null}
        </main>
      </div>
    </div>
  );
}

function ChildEditor({
  child,
  canRemove,
  onChange,
  onOwn,
  onRemove,
}: {
  child: ChildInput;
  canRemove: boolean;
  onChange: (patch: Partial<ChildInput>) => void;
  onOwn: (own: boolean) => void;
  onRemove: () => void;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[#e4dccb] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">This child</h2>
        {canRemove ? (
          <button type="button" onClick={onRemove} className="text-sm text-[#8a3d32]">
            Remove
          </button>
        ) : null}
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Name</span>
        <input
          value={child.name}
          onChange={(event) => onChange({ name: event.target.value })}
          className="rounded-lg border border-[#ddd3c3] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="flex items-baseline justify-between">
          <span className="font-medium">Age {child.age}</span>
          <span className="font-mono text-xs text-[#6d6258]">{bandName(child.age)}</span>
        </span>
        <input
          type="range"
          min={2}
          max={18}
          value={child.age}
          aria-label="Age"
          onChange={(event) => onChange({ age: Number(event.target.value) })}
          className="accent-[#1f6f66]"
        />
        <span className="flex justify-between font-mono text-[10px] tracking-wide text-[#8a7560] uppercase">
          <span>2–4</span>
          <span>5–8</span>
          <span>9–12</span>
          <span>13–18</span>
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm leading-5">
        <input
          type="checkbox"
          checked={child.own}
          onChange={(event) => onOwn(event.target.checked)}
          className="mt-1 accent-[#1f6f66]"
        />
        <span>
          Own answers. Goals, pain, niche, and guidance below replace the family ones for this
          child.
        </span>
      </label>
      {child.own ? (
        <ConcernFields
          goals={child.goals}
          painId={child.painId}
          nicheId={child.nicheId}
          guidance={child.guidance}
          onGoals={(goals) => onChange(syncConcerns(child, goals))}
          onPain={(painId) => onChange({ painId })}
          onNiche={(nicheId) => onChange({ nicheId })}
          onGuidance={(guidance) => onChange({ guidance })}
        />
      ) : null}
    </section>
  );
}

function ConcernFields({
  goals,
  painId,
  nicheId,
  guidance,
  onGoals,
  onPain,
  onNiche,
  onGuidance,
}: {
  goals: GoalId[];
  painId: string;
  nicheId: string;
  guidance: GuidanceLevel;
  onGoals: (goals: GoalId[]) => void;
  onPain: (painId: string) => void;
  onNiche: (nicheId: string) => void;
  onGuidance: (guidance: GuidanceLevel) => void;
}) {
  const primary = goals[0];
  const goal = primary ? getGoal(primary) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Goals, in order</h3>
        <p className="text-xs leading-5 text-[#6d6258]">
          The first goal weighs 100, the second 80, the third 65. Pain and niche signals come from
          the first goal only.
        </p>
        {goals.length > 0 ? (
          <ol className="flex flex-col gap-1">
            {goals.map((id, index) => {
              const item = getGoal(id);
              const weight = GOAL_WEIGHTS[index];
              return (
                <li
                  key={id}
                  className="flex items-center gap-2 rounded-lg border border-[#eee6da] bg-[#fbfaf7] px-2 py-1.5"
                >
                  <span className="w-8 font-mono text-xs text-[#8a7560]">{weight ?? "—"}</span>
                  <span className="flex-1 text-sm">
                    {item.emoji} {item.title}
                  </span>
                  <button
                    type="button"
                    aria-label={`Move ${item.title} earlier`}
                    disabled={index === 0}
                    onClick={() => onGoals(moveItem(goals, index, -1))}
                    className="px-1 text-[#6d6258] disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${item.title} later`}
                    disabled={index === goals.length - 1}
                    onClick={() => onGoals(moveItem(goals, index, 1))}
                    className="px-1 text-[#6d6258] disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => onGoals(goals.filter((goalId) => goalId !== id))}
                    className="px-1 text-[#8a3d32]"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="rounded-lg bg-[#fff6e4] px-3 py-2 text-sm text-[#8a5a12]">
            No goals. The allocator returns an empty plan.
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {listGoals()
            .filter((item) => !goals.includes(item.id))
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onGoals([...goals, item.id])}
                className="rounded-full border border-[#ddd3c3] bg-white px-2.5 py-1 text-xs"
              >
                {item.emoji} {item.title}
              </button>
            ))}
        </div>
      </div>

      {goal ? (
        <>
          <ChoiceRow
            label={`Pain · ${goal.title}`}
            value={painId}
            options={goal.pains.map((pain) => ({ id: pain.id, label: `${pain.emoji} ${pain.label}` }))}
            onChange={onPain}
          />
          <ChoiceRow
            label={`Niche · ${goal.title}`}
            value={nicheId}
            options={goal.niches.map((niche) => ({
              id: niche.id,
              label: `${niche.emoji} ${niche.label}`,
            }))}
            onChange={onNiche}
          />
        </>
      ) : null}

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Guidance</h3>
        <div className="grid grid-cols-3 gap-2">
          {GUIDANCE_OPTIONS.map((option) => {
            const on = guidance === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onGuidance(option.id)}
                className={`rounded-xl border px-2 py-2 text-left ${
                  on ? "border-[#1f6f66] bg-[#e7f4f2]" : "border-[#e4dccb] bg-white"
                }`}
              >
                <span className="block text-sm font-medium">
                  {option.emoji} {option.title}
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-[#6d6258]">{option.detail}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChoiceRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{label}</h3>
      <div className="flex flex-col gap-1">
        {options.map((option) => {
          const on = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-lg border px-2.5 py-1.5 text-left text-sm ${
                on ? "border-[#1f6f66] bg-[#e7f4f2]" : "border-[#eee6da] bg-white"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function bandName(age: number) {
  if (age <= 4) return "2–4y";
  if (age <= 8) return "5–8y";
  if (age <= 12) return "9–12y";
  return "13–18y";
}

function PlanView({ result, when }: { result: ChildSimulation; when: Date }) {
  const quota = dailyQuota(result.guidance);
  const extras = result.assignment.habits.filter((habit) => isExtra(habit.role));
  const expectedAnchors = result.guidance === "light" ? 6 : 9;
  const goalTitles = result.goals.map((id) => getGoal(id).title);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-[#e4dccb] bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {result.name}, {result.age}
            </h2>
            <p className="mt-1 text-sm text-[#6d6258]">
              {result.band} · {result.guidance.replaceAll("_", " ")} · ISO week {result.week}
            </p>
          </div>
          <p className="text-sm text-[#5c5148]">
            {goalTitles.length > 0 ? goalTitles.join(" · ") : "No goals"}
          </p>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Profile" value={String(result.assignment.profile.length)} />
          <Stat label="Anchors" value={`${result.assignment.anchors.length}/${expectedAnchors}`} />
          <Stat label="Extras" value={String(extras.length)} />
          <Stat label="Skills" value={String(result.assignment.skills.length)} />
        </dl>
        <p className="mt-3 text-xs leading-5 text-[#6d6258]">
          Quota for this guidance is {quota.Morning} morning, {quota.Afternoon} afternoon,{" "}
          {quota.Evening} evening. The daily list is the anchors plus one extra rotated into each
          daypart. An all-day extra keeps the evening column, and its label names the slot it was
          picked for.
        </p>
        {result.signals.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {result.signals.map((signal) => (
              <span
                key={signal}
                className="rounded-full bg-[#f3efe6] px-2 py-0.5 font-mono text-[11px] text-[#5c5148]"
              >
                {signal}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#6d6258]">No signals for these answers.</p>
        )}
      </section>

      {result.goals.length === 0 ? (
        <p className="rounded-2xl border border-[#efd7a8] bg-[#fff6e4] px-4 py-3 text-sm text-[#8a5a12]">
          Add at least one goal. Empty goals short-circuit the allocator.
        </p>
      ) : (
        <>
          <div className="grid min-w-0 gap-4 xl:grid-cols-3">
            {DAYPARTS.map((time) => (
              <DaypartColumn
                key={time}
                time={time}
                habits={result.assignment.habits.filter((habit) => habit.defaultTime === time)}
                catalog={result.catalog}
                when={when}
              />
            ))}
          </div>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-medium tracking-[0.14em] text-[#8a7560] uppercase">
              Skills this week
            </h3>
            {result.assignment.skills.length === 0 ? (
              <p className="text-sm text-[#6d6258]">No opportunity habits for this age.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {result.assignment.skills.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    detail={lookup(result.catalog, habit.id)}
                    when={when}
                    kicker="Skill"
                  />
                ))}
              </div>
            )}
          </section>

          <details className="rounded-2xl border border-[#e4dccb] bg-white">
            <summary className="cursor-pointer px-5 py-4 text-sm font-medium">
              Profile pool · {result.assignment.profile.length} habits
            </summary>
            <ul className="flex flex-col divide-y divide-[#f0e9de] border-t border-[#f0e9de]">
              {result.assignment.profile.map((habit) => {
                const placed = result.assignment.habits.find((item) => item.id === habit.id);
                const skill = result.assignment.skills.some((item) => item.id === habit.id);
                return (
                  <li key={habit.id} className="flex items-baseline justify-between gap-3 px-5 py-2 text-sm">
                    <span>
                      <span className="font-medium">{habit.title}</span>
                      <span className="ml-2 text-[#6d6258]">{words(habit.category)}</span>
                      {placed ? (
                        <span className="ml-2 text-xs text-[#1f6f66]">{roleLabel(placed.role)}</span>
                      ) : null}
                      {skill ? <span className="ml-2 text-xs text-[#543c8c]">skill</span> : null}
                    </span>
                    <span className="font-mono text-xs text-[#8a7560]">{habit.score ?? "—"}</span>
                  </li>
                );
              })}
            </ul>
          </details>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f7f4ee] px-3 py-2">
      <dt className="text-[11px] tracking-wide text-[#8a7560] uppercase">{label}</dt>
      <dd className="mt-0.5 font-mono text-lg">{value}</dd>
    </div>
  );
}

function DaypartColumn({
  time,
  habits,
  catalog,
  when,
}: {
  time: HabitTime;
  habits: AssignedHabit[];
  catalog: CatalogInspection[];
  when: Date;
}) {
  const tone = DAYPART_TONE[time] ?? DAYPART_TONE.Morning;
  return (
    <section className={`min-w-0 rounded-2xl border ${tone?.line} ${tone?.wash} p-3`}>
      <h3 className={`px-1 py-1 text-sm font-semibold ${tone?.ink}`}>
        {habitTimeEmoji(time)} {time}
        <span className="ml-2 font-mono text-xs font-normal">{habits.length}</span>
      </h3>
      <div className="mt-2 flex flex-col gap-2">
        {habits.length === 0 ? (
          <p className="px-1 text-sm text-[#6d6258]">Nothing landed here.</p>
        ) : (
          habits.map((habit) => (
            <HabitCard
              key={`${habit.role}-${habit.id}`}
              habit={habit}
              detail={lookup(catalog, habit.id)}
              when={when}
              kicker={roleLabel(habit.role)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function lookup(catalog: CatalogInspection[], id: string) {
  return catalog.find((habit) => habit.id === id);
}

function HabitCard({
  habit,
  detail,
  when,
  kicker,
}: {
  habit: AssignedHabit;
  detail: CatalogInspection | undefined;
  when: Date;
  kicker: string;
}) {
  const [open, setOpen] = useState(false);
  const prompt = habit.prompts ? todaysPrompt(habit.prompts, when) : undefined;
  const extra = isExtra(habit.role);

  return (
    <article
      className={`rounded-xl bg-white px-3 py-2.5 shadow-[0_1px_0_rgba(60,40,20,0.04)] ${
        extra ? "border border-dashed border-[#c8bba6]" : "border border-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium tracking-wide text-[#8a7560] uppercase">
          {kicker}
          {habit.foundation ? " · foundation" : ""}
        </p>
        <span className="font-mono text-[11px] text-[#8a7560]">{habit.score ?? "—"}</span>
      </div>
      <h4 className="mt-0.5 text-sm font-medium leading-5">{habit.title}</h4>
      <p className="text-xs leading-5 text-[#6d6258]">{habit.subtitle}</p>
      <p className="mt-1 text-[11px] text-[#8a7560]">
        {words(habit.category)} · {habit.target} · {habitFrequencyLabel(habit.frequency)}
        {habit.cluster ? ` · ${words(habit.cluster)}` : ""}
      </p>
      {detail && (detail.matchedGoals.length > 0 || detail.matchedSignals.length > 0) ? (
        <p className="mt-1 text-[11px] leading-4 text-[#1f6f66]">
          {[
            ...detail.matchedGoals.map((goal) => getGoal(goal).title),
            ...detail.matchedSignals,
          ].join(" · ")}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-2 text-xs text-[#5c5148]"
      >
        {open ? "Hide" : "Why"}
      </button>
      {open ? (
        <div className="mt-2 border-t border-[#f0e9de] pt-2 text-xs leading-5 text-[#3f342c]">
          <p>{habit.description}</p>
          {prompt ? <p className="mt-1 text-[#5c5148]">Today’s prompt: {prompt}</p> : null}
          {detail ? (
            <p className="mt-1 font-mono text-[11px] text-[#6d6258]">
              {habit.id}
              {detail.ageGroups.length > 0 ? ` · ${detail.ageGroups.join(", ")}` : ""}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function CompareView({
  results,
  onOpen,
}: {
  results: ChildSimulation[];
  onOpen: (index: number) => void;
}) {
  if (results.length === 0) return null;
  return (
    <div className="flex gap-4 overflow-x-auto pb-6">
      {results.map((result, index) => {
        const extras = result.assignment.habits.filter((habit) => isExtra(habit.role));
        return (
          <article
            key={result.key}
            className="w-72 shrink-0 rounded-2xl border border-[#e4dccb] bg-white p-4"
          >
            <button type="button" onClick={() => onOpen(index)} className="text-left">
              <h2 className="text-lg font-semibold">
                {result.name}, {result.age}
              </h2>
              <p className="text-xs text-[#6d6258]">
                {result.band} · {result.guidance.replaceAll("_", " ")}
              </p>
            </button>
            <p className="mt-2 text-xs leading-5 text-[#5c5148]">
              {result.goals.length > 0
                ? result.goals.map((id) => getGoal(id).title).join(" · ")
                : "No goals"}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {result.signals.map((signal) => (
                <span key={signal} className="rounded-full bg-[#f3efe6] px-1.5 py-0.5 font-mono text-[10px]">
                  {signal}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {DAYPARTS.map((time) => {
                const habits = result.assignment.habits.filter((habit) => habit.defaultTime === time);
                const tone = DAYPART_TONE[time];
                return (
                  <div key={time}>
                    <h3 className={`text-xs font-semibold ${tone?.ink}`}>
                      {habitTimeEmoji(time)} {time}
                    </h3>
                    <ul className="mt-1 flex flex-col gap-1">
                      {habits.map((habit) => (
                        <li key={`${habit.role}-${habit.id}`} className="text-sm leading-5">
                          <span className="text-[10px] tracking-wide text-[#8a7560] uppercase">
                            {roleLabel(habit.role)}
                          </span>
                          <span className="mt-0.5 block">{habit.title}</span>
                        </li>
                      ))}
                      {habits.length === 0 ? (
                        <li className="text-xs text-[#8a7560]">Empty</li>
                      ) : null}
                    </ul>
                  </div>
                );
              })}
              <div>
                <h3 className="text-xs font-semibold text-[#543c8c]">Skills</h3>
                <ul className="mt-1 flex flex-col gap-1 text-sm">
                  {result.assignment.skills.map((habit) => (
                    <li key={habit.id}>{habit.title}</li>
                  ))}
                </ul>
                {extras.length > 0 ? (
                  <p className="mt-2 text-[11px] text-[#6d6258]">{extras.length} extras included above</p>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function CatalogView({ result, when }: { result: ChildSimulation; when: Date }) {
  const [query, setQuery] = useState("");
  const [pool, setPool] = useState<CatalogPool>("profile");
  const [category, setCategory] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const names = new Set(result.catalog.map((habit) => habit.category));
    return [...names].sort();
  }, [result.catalog]);

  const daily = new Set(result.assignment.habits.map((habit) => habit.id));
  const skills = new Set(result.assignment.skills.map((habit) => habit.id));

  const rows = result.catalog
    .filter((habit) => {
      if (pool === "profile" && !habit.inProfilePool) return false;
      if (pool === "skills" && !(habit.opportunity && habit.ageEligible)) return false;
      if (pool === "out" && (habit.inProfilePool || (habit.opportunity && habit.ageEligible))) return false;
      if (category !== "all" && habit.category !== category) return false;
      if (!query.trim()) return true;
      const haystack = [
        habit.title,
        habit.subtitle,
        habit.id,
        habit.category,
        habit.cluster ?? "",
        ...habit.tags,
        ...habit.recommendedWhen,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    })
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title));

  const counts = {
    all: result.catalog.length,
    profile: result.catalog.filter((habit) => habit.inProfilePool).length,
    skills: result.catalog.filter((habit) => habit.opportunity && habit.ageEligible).length,
    out: result.catalog.filter(
      (habit) => !habit.inProfilePool && !(habit.opportunity && habit.ageEligible),
    ).length,
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Catalog for {result.name}, {result.age}
        </h2>
        <p className="mt-1 text-sm text-[#6d6258]">
          {result.band}. Eligible habits can enter the profile, which keeps at most 35. Scores
          here are the base score, before a role’s spread penalties.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["profile", `Eligible ${counts.profile}`],
            ["skills", `Skills ${counts.skills}`],
            ["out", `Out ${counts.out}`],
            ["all", `All ${counts.all}`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPool(id)}
            className={`rounded-full px-3 py-1 text-sm ${
              pool === id ? "bg-[#1f6f66] text-white" : "bg-white text-[#3f342c]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, tag, signal"
          className="min-w-52 flex-1 rounded-lg border border-[#ddd3c3] bg-white px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-lg border border-[#ddd3c3] bg-white px-3 py-2 text-sm"
          aria-label="Category"
        >
          <option value="all">All categories</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {words(name)}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-[#6d6258]">{rows.length} shown</p>
      <ul className="flex flex-col gap-2">
        {rows.map((habit) => {
          const open = openId === habit.id;
          const prompt = habit.prompts ? todaysPrompt(habit.prompts, when) : undefined;
          return (
            <li key={habit.id} className="rounded-xl border border-[#e4dccb] bg-white px-4 py-3">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : habit.id)}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <span>
                  <span className="block text-sm font-medium">{habit.title}</span>
                  <span className="mt-0.5 block text-xs text-[#6d6258]">
                    {words(habit.category)} · {habit.defaultTime} · {habit.target}
                    {daily.has(habit.id) ? " · on the daily list" : ""}
                    {skills.has(habit.id) ? " · skill this week" : ""}
                  </span>
                </span>
                <span className="font-mono text-sm text-[#8a7560]">{habit.score}</span>
              </button>
              {open ? (
                <div className="mt-2 border-t border-[#f0e9de] pt-2 text-sm leading-6 text-[#3f342c]">
                  <p>{habit.description}</p>
                  <p className="mt-1 text-xs text-[#6d6258]">{habit.subtitle}</p>
                  {habit.matchedGoals.length > 0 || habit.matchedSignals.length > 0 ? (
                    <p className="mt-1 text-xs text-[#1f6f66]">
                      Matches {habit.matchedGoals.map((goal) => getGoal(goal).title).join(", ")}
                      {habit.matchedSignals.length > 0
                        ? ` · signals ${habit.matchedSignals.join(", ")}`
                        : ""}
                    </p>
                  ) : null}
                  {habit.rejectReasons.length > 0 ? (
                    <p className="mt-1 text-xs text-[#8a5a12]">{habit.rejectReasons.join(" · ")}</p>
                  ) : null}
                  {prompt ? <p className="mt-1 text-xs">Today’s prompt: {prompt}</p> : null}
                  <p className="mt-1 font-mono text-[11px] text-[#8a7560]">
                    {habit.id} · {habit.ageGroups.join(", ")} · {habit.frequency}
                    {habit.cluster ? ` · ${habit.cluster}` : ""}
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
