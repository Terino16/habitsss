export type Audience = 'child' | 'children' | 'family';

export type GoalId =
  | 'sleep'
  | 'eating'
  | 'focus'
  | 'emotional'
  | 'school'
  | 'behaviour'
  | 'screens'
  | 'communication'
  | 'confidence'
  | 'connection';

export type HelpStyle = 'what_to_do' | 'what_to_say' | 'together' | 'routines' | 'why';

export type Intensity = 'daily' | 'weekly' | 'occasionally' | 'prevent';

export type GuidanceLevel = 'light' | 'balanced' | 'hands_on';

export type AgeBand = 'little' | 'growing' | 'bigger';

export type BillingChoice = 'annual' | 'monthly';

export type ChildConcerns = {
  goals: GoalId[];
  painId: string | null;
  intensity: Intensity | null;
  helpStyles: HelpStyle[];
  nicheId: string | null;
  guidance?: GuidanceLevel | null;
};

export type ChildDraft = {
  id?: string;
  name: string;
  age: number | null;
  birthYear?: number | null;
  concerns?: ChildConcerns | null;
};

export type HabitMark = 'missed' | 'late' | 'ontime';

export type Draft = {
  audience: Audience | null;
  children: ChildDraft[];
  goals: GoalId[];
  painId: string | null;
  intensity: Intensity | null;
  helpStyles: HelpStyle[];
  nicheId: string | null;
  guidance: GuidanceLevel | null;
  parentName: string;
  avatarUri: string | null;
  notifications: 'enabled' | 'later' | null;
  billingChoice: BillingChoice;
  unlocked: boolean;
  completed: boolean;
  firstTaskDone: boolean;
  activeChildId: string | null;
  taskDoneIds: string[];
  habitMarks: Record<string, HabitMark>;
};

export type StepId =
  | 'hook'
  | 'audience'
  | 'childName'
  | 'childAge'
  | 'addChild'
  | 'goals'
  | 'pain'
  | 'intensity'
  | 'guidance'
  | 'help'
  | 'niche'
  | 'reflection'
  | 'notifications'
  | 'account'
  | 'building'
  | 'reveal'
  | 'trust'
  | 'transformDo'
  | 'transformSay'
  | 'paywall'
  | 'celebration';

export type Cursor = {
  step: StepId;
  childIndex: number;
};

export type PlanBlock = {
  id: 'morning' | 'afternoon' | 'evening';
  period: string;
  emoji: string;
  title: string;
  emphasized: boolean;
};

export type HabitTime = 'Morning' | 'Afternoon' | 'Evening' | 'All day' | 'Event-based';

export type HabitFrequency =
  | 'daily'
  | 'few_times_week'
  | 'weekly'
  | 'monthly'
  | 'seasonal'
  | 'event_based'
  | 'opportunity_based'
  | 'one_time_learning';

export type HabitPriority = 'foundation' | 'recommended' | 'targeted' | 'enrichment';

export type HabitKind = 'routine' | 'opportunity' | 'practice' | 'environment' | 'conversation';

export type HabitTarget = 'parent' | 'child' | 'family' | 'environment';

export type AssignedHabit = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  defaultTime: HabitTime;
  category: string;
  frequency: HabitFrequency;
  priority: HabitPriority;
  habitType: HabitKind;
  target: HabitTarget;
  cluster?: string;
  prompts?: string[];
  activeMonths?: number[];
  foundation?: boolean;
  /** Anchor role this habit filled, or `extra` for a rotated daypart extra. */
  role?: string;
  /** Score at selection time. Anchor scores include spread penalties. */
  score?: number;
};

export type ChildPlan = {
  name: string;
  age: number;
  habits: AssignedHabit[];
  profile: AssignedHabit[];
  anchors: AssignedHabit[];
  skills: AssignedHabit[];
};

export type FamilyPlan = {
  childLabel: string;
  parentName: string;
  childKey: string;
  guidance: GuidanceLevel;
  goals: GoalId[];
  habitMarks: Record<string, HabitMark>;
  blocks: PlanBlock[];
  children: ChildPlan[];
  skill: { label: string; title: string; detail: string; emphasized: boolean };
  weeklyGoal: string;
  builtAround: string[];
  firstTask: { emoji: string; title: string; detail: string; meta: string };
  parentHabit: { emoji: string; title: string; detail: string } | null;
  sayScript: { childLine: string; parentLine: string };
  helpNow: string[];
  priorityTitle: string;
  priorityDetail: string;
  challengeTitle: string;
  wantTitle: string;
  wantDetail: string;
  ageLine: string;
  focusAge: number;
};

export function emptyDraft(): Draft {
  return {
    audience: null,
    children: [{ name: '', age: null }],
    goals: [],
    painId: null,
    intensity: null,
    helpStyles: [],
    nicheId: null,
    guidance: null,
    parentName: '',
    avatarUri: null,
    notifications: null,
    billingChoice: 'annual',
    unlocked: false,
    completed: false,
    firstTaskDone: false,
    activeChildId: null,
    taskDoneIds: [],
    habitMarks: {},
  };
}
