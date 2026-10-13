import {
  assignHabits,
  catalogAgeGroup,
  inspectCatalog,
  isoWeek,
  type CatalogInspection,
  type HabitAssignment,
} from "../../habits allocation/assign-habits";
import { profileSignals } from "../../habits allocation/habit-signals";
import type { GoalId, GuidanceLevel } from "../../habits allocation/types";

export type ChildInput = {
  key: string;
  name: string;
  age: number;
  own: boolean;
  contextSignals?: string[];
  goals: GoalId[];
  painId: string;
  nicheId: string;
  guidance: GuidanceLevel;
};

export type FamilyInput = {
  goals: GoalId[];
  painId: string;
  nicheId: string;
  guidance: GuidanceLevel;
  date: string;
};

export type ChildSimulation = {
  key: string;
  name: string;
  age: number;
  band: string;
  goals: GoalId[];
  guidance: GuidanceLevel;
  painId: string | null;
  nicheId: string | null;
  signals: string[];
  week: number;
  assignment: HabitAssignment;
  catalog: CatalogInspection[];
};

export function simulationDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date(2026, 9, 11);
  return new Date(year, month - 1, day);
}

/** Same child resolution as `buildPlan`, with an explicit date for week rotation. */
export function runChild(family: FamilyInput, child: ChildInput): ChildSimulation {
  const goals = child.own && child.goals.length > 0 ? child.goals : family.goals;
  const guidance = child.own ? child.guidance : family.guidance;
  const painId = child.own ? child.painId : family.painId;
  const nicheId = child.own ? child.nicheId : family.nicheId;
  const signals = profileSignals({
    goals,
    contextSignals: child.contextSignals,
    painId: goals[0] ? painId : null,
    nicheId: goals[0] ? nicheId : null,
  });
  const date = simulationDate(family.date);
  const assignment = assignHabits({
    age: child.age,
    goals,
    signals,
    guidance,
    childKey: child.key,
    date,
  });

  return {
    key: child.key,
    name: child.name.trim() || "Unnamed",
    age: child.age,
    band: catalogAgeGroup(child.age),
    goals,
    guidance,
    painId: goals[0] ? painId : null,
    nicheId: goals[0] ? nicheId : null,
    signals: [...signals].sort(),
    week: isoWeek(date),
    assignment,
    catalog: inspectCatalog({ age: child.age, goals, signals, date }),
  };
}
