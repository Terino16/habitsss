import { colors } from '@/constants/theme';

import type { AgeBand, Audience, GoalId, GuidanceLevel, HelpStyle, Intensity } from './types';

export type Routine = {
  morning: string;
  afternoon: string;
  evening: string;
};

export type PainOption = {
  id: string;
  emoji: string;
  label: string;
  evening: string;
  weekly: string;
};

export type NicheOption = {
  id: string;
  emoji: string;
  label: string;
  skill: string;
  childLine: string;
  parentLine: string;
};

export type GoalContent = {
  id: GoalId;
  emoji: string;
  title: string;
  topic: string;
  tint: string;
  painPrompt: string;
  pains: PainOption[];
  nichePrompt: string;
  niches: NicheOption[];
  routines: Record<AgeBand, Routine>;
  connectionPrompt: string;
  why: string;
  routineAnchor: string;
  tinyStep: Record<AgeBand, string>;
  hotScenario: string;
};

export const AGES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

export function ageBand(age: number): AgeBand {
  if (age <= 4) return 'little';
  if (age <= 7) return 'growing';
  return 'bigger';
}

export function fill(template: string, name: string) {
  return template.replaceAll('{name}', name);
}

export const AUDIENCES: { id: Audience; title: string; detail: string }[] = [
  { id: 'child', title: 'One child', detail: 'A plan only for them' },
  { id: 'children', title: 'Two or more children', detail: 'A separate plan for each child' },
  { id: 'family', title: 'Me and my kids', detail: 'Their plan, plus habits for you' },
];

export const HELP_OPTIONS: {
  id: HelpStyle;
  title: string;
  detail: string;
  emoji: string;
  want: string;
  short: string;
}[] = [
  {
    id: 'what_to_do',
    title: 'Tell me what to do',
    detail: 'Clear steps in the moment',
    emoji: '🧭',
    want: 'Clear steps in the moment',
    short: 'Steps in the moment',
  },
  {
    id: 'what_to_say',
    title: 'Tell me what to say',
    detail: 'Words I can actually use',
    emoji: '💬',
    want: 'Know exactly what to say',
    short: 'Words to use',
  },
  {
    id: 'together',
    title: 'Give us activities to do together',
    detail: 'Simple ways to connect',
    emoji: '🤝',
    want: 'Activities to do together',
    short: 'Activities together',
  },
  {
    id: 'routines',
    title: 'Help us build better routines',
    detail: 'Daily habits that stick',
    emoji: '🔁',
    want: 'Routines that stick',
    short: 'Daily routines',
  },
  {
    id: 'why',
    title: 'Help me understand why',
    detail: 'Expert-backed guidance',
    emoji: '📘',
    want: 'Help me understand why',
    short: 'Understand why',
  },
];

export const INTENSITY_OPTIONS: { id: Intensity; label: string }[] = [
  { id: 'daily', label: 'Almost every day' },
  { id: 'weekly', label: 'A few times a week' },
  { id: 'occasionally', label: 'Occasionally' },
  { id: 'prevent', label: "We're trying to prevent it" },
];

export const GUIDANCE_OPTIONS: { id: GuidanceLevel; emoji: string; title: string; detail: string }[] = [
  { id: 'light', emoji: '🌤️', title: 'Light', detail: '2 morning · 2 afternoon · 2 evening' },
  { id: 'balanced', emoji: '⚖️', title: 'Balanced', detail: '3 morning · 3 afternoon · 3 evening' },
  { id: 'hands_on', emoji: '🧭', title: 'Hands-on', detail: '4 morning · 4 afternoon · 4 evening' },
];

export function intensityAck(intensity: Intensity, topic: string, name: string) {
  switch (intensity) {
    case 'daily':
      return `Got it. We'll prioritize simple ${topic} strategies for ${name} that work in the moment — not articles to read later.`;
    case 'weekly':
      return `We'll build a small ${topic} routine for ${name} that you can repeat a few times a week.`;
    case 'occasionally':
      return `We'll give you a short plan for when ${topic} gets hard with ${name}, so you're not deciding from scratch.`;
    case 'prevent':
      return `We'll start with gentle habits for ${name} before ${topic} becomes a daily fight.`;
  }
}

export function skillKicker(intensity: Intensity) {
  switch (intensity) {
    case 'daily':
      return 'In the moment';
    case 'weekly':
      return 'A small routine';
    case 'occasionally':
      return 'When it shows up';
    case 'prevent':
      return 'Before it becomes a fight';
  }
}

const GOALS: GoalContent[] = [
  {
    id: 'sleep',
    emoji: '😴',
    title: 'Better sleep',
    topic: 'bedtime',
    tint: colors.lavenderSoft,
    painPrompt: "What's bedtime usually like with {name}?",
    pains: [
      { id: 'long', emoji: '⏳', label: 'Bedtime takes forever', evening: 'A shorter bedtime, same order', weekly: '5 nights of the same short bedtime sequence' },
      { id: 'leaves', emoji: '🚪', label: 'They keep leaving the room', evening: 'A one-check-in bedtime', weekly: 'Practice the one check-in, 4 nights' },
      { id: 'fears', emoji: '😨', label: 'Fears or worries at night', evening: 'A cozy worry ritual', weekly: 'Use the worry ritual 4 nights' },
      { id: 'early', emoji: '🌅', label: 'Waking too early', evening: 'A morning-clock plan', weekly: 'Same wake window, 5 mornings' },
      { id: 'settle', emoji: '🌊', label: "They can't settle their body", evening: 'A body-settle routine', weekly: '3 nights of the settle sequence' },
      { id: 'inconsistent', emoji: '📅', label: 'Bedtime changes every night', evening: 'One bedtime, written down', weekly: 'The same bedtime, 5 nights' },
    ],
    nichePrompt: 'What usually prevents {name} from falling asleep?',
    niches: [
      { id: 'wired', emoji: '⚡', label: 'Body is still wired', skill: 'What to say while {name} settles a busy body', childLine: "I can't stop moving.", parentLine: "Your body had a big day. Let's do three slow breaths, then the lights stay low." },
      { id: 'room', emoji: '🚪', label: 'They come out of the room', skill: 'What to say when {name} leaves the room', childLine: 'I need to tell you something.', parentLine: "I'll walk you back. One check-in, then your bed is the place to rest." },
      { id: 'scared', emoji: '😨', label: "They're scared", skill: 'What to say when {name} is scared at bedtime', childLine: "I don't want to be alone.", parentLine: "That feeling is real. I'll stay for one song, then the night-light stays with you." },
      { id: 'screens', emoji: '📱', label: 'Screens too close to bed', skill: 'What to say when screens run into bedtime', childLine: 'Just one more episode.', parentLine: 'The episode can wait until tomorrow. Bedtime starts when the screen goes off.' },
      { id: 'not-tired', emoji: '👀', label: "They don't seem tired", skill: "What to say when {name} insists they aren't tired", childLine: "I'm not tired yet.", parentLine: "You don't have to fall asleep. You do get to rest in bed while your body catches up." },
    ],
    routines: {
      little: { morning: 'A slow, light-filled wake-up', afternoon: 'Outdoor play before dinner', evening: 'Tiny bedtime, same three steps' },
      growing: { morning: 'A calm start without a rush', afternoon: 'Daylight play after school', evening: 'Bedtime routine, same order' },
      bigger: { morning: 'Their own wake-up checklist', afternoon: 'After-school wind-down', evening: 'Screens off, then the routine' },
    },
    connectionPrompt: 'Ask {name} one thing that would make tonight feel cozier.',
    why: 'A predictable bedtime tells {name} the day is over, which is often more calming than trying harder to fall asleep.',
    routineAnchor: 'bedtime',
    tinyStep: {
      little: 'Dim one light and do the same two-step bedtime with {name} tonight.',
      growing: 'Name the three bedtime steps out loud with {name} before they start.',
      bigger: 'Let {name} run the bedtime checklist while you stay nearby.',
    },
    hotScenario: "Won't sleep",
  },
  {
    id: 'eating',
    emoji: '🥦',
    title: 'Healthier eating',
    topic: 'meals',
    tint: colors.apricotSoft,
    painPrompt: "What's hardest about meals with {name}?",
    pains: [
      { id: 'refuses', emoji: '🍽️', label: 'They refuse dinner', evening: 'A low-pressure family dinner', weekly: '3 dinners with no short-order cooking' },
      { id: 'beige', emoji: '🥣', label: 'Only a few familiar foods', evening: 'Safe foods plus one look-only food', weekly: 'Offer one new food beside a safe food, 4 times' },
      { id: 'battle', emoji: '😤', label: 'Meals turn into battles', evening: 'Dinner without negotiating bites', weekly: '3 meals where you stop the bite count' },
      { id: 'snacks', emoji: '🍪', label: 'Snacking replaces meals', evening: 'A snack cutoff before dinner', weekly: 'Hold the pre-dinner snack, 4 days' },
      { id: 'new', emoji: '🥦', label: 'New foods cause a standoff', evening: 'Exposure without the bite', weekly: 'One look, smell, or lick, 4 times' },
      { id: 'pressure', emoji: '💭', label: "I'm not sure how to lower the pressure", evening: 'You serve, they decide', weekly: 'Practice the phrase “you do not have to eat it”, 4 meals' },
    ],
    nichePrompt: 'How many foods will {name} reliably eat?',
    niches: [
      { id: 'under5', emoji: '🍽️', label: 'Fewer than 5', skill: 'How to keep meals calm on a very short menu', childLine: 'I only eat these.', parentLine: "These foods stay on the plate. You don't have to eat anything new tonight." },
      { id: 'five-ten', emoji: '🥗', label: '5–10', skill: 'How to offer one new food beside the safe ones', childLine: "I don't like that.", parentLine: "You don't have to taste it. It can sit on the plate while you eat what you know." },
      { id: 'ten-twenty', emoji: '🥙', label: '10–20', skill: 'How to widen meals without a debate', childLine: 'Can I just have the usual?', parentLine: 'The usual is here. The new food is here too, and tasting is optional.' },
      { id: 'twenty', emoji: '🌈', label: '20 or more', skill: 'How to keep variety without pressure', childLine: 'Why do we have to eat this?', parentLine: "We're practicing family meals, not cleaning the plate. Eat what your body wants from what's served." },
    ],
    routines: {
      little: { morning: 'One familiar food at breakfast', afternoon: 'A playful food look, no bites required', evening: 'Dinner with a safe food on the plate' },
      growing: { morning: 'Breakfast they can serve themselves', afternoon: 'A snack that still leaves room for dinner', evening: 'Family dinner, no short-order meal' },
      bigger: { morning: 'They build their own breakfast', afternoon: 'An after-school snack with a stop time', evening: 'Dinner where they choose from what is served' },
    },
    connectionPrompt: 'Ask {name} which food on the plate looks okay. No pressure to try more.',
    why: 'Pressure shrinks appetite. A safe food on the plate lets {name} stay at the table without a power struggle.',
    routineAnchor: 'dinner',
    tinyStep: {
      little: 'Put one safe food on {name}\'s plate and skip the “just one bite” tonight.',
      growing: 'Serve the family meal with one food {name} already accepts.',
      bigger: 'Let {name} serve their own plate from the foods you made.',
    },
    hotScenario: 'Picky dinner',
  },
  {
    id: 'focus',
    emoji: '🧠',
    title: 'Focus & ADHD',
    topic: 'focus',
    tint: colors.blueSoft,
    painPrompt: 'When does focus fall apart most with {name}?',
    pains: [
      { id: 'homework', emoji: '📚', label: 'Homework becomes a battle', evening: 'A 10-minute homework start', weekly: 'Start homework with a 10-minute timer, 4 days' },
      { id: 'instructions', emoji: '👂', label: "Instructions don't seem to stick", evening: 'One instruction at a time', weekly: 'Give one-step directions, 5 days' },
      { id: 'still', emoji: '🪑', label: 'Sitting still feels impossible', evening: 'Movement built into the task', weekly: 'Add a movement break to one task, 4 days' },
      { id: 'mornings', emoji: '☀️', label: 'Mornings feel chaotic', evening: 'Clothes and bag ready the night before', weekly: 'Pack the bag at night, 4 evenings' },
      { id: 'transitions', emoji: '🔄', label: 'Transitions are tough', evening: 'A two-minute warning before the next thing', weekly: 'Use a two-minute warning, 5 transitions' },
    ],
    nichePrompt: 'When does focus fall apart most for {name}?',
    niches: [
      { id: 'homework', emoji: '📚', label: 'Homework', skill: 'What to say when homework stalls for {name}', childLine: "I can't do this.", parentLine: "We'll do ten minutes, then a break. You only have to start." },
      { id: 'mornings', emoji: '🌅', label: 'Mornings', skill: 'What to say when the morning stalls', childLine: "I don't want to get dressed.", parentLine: 'First socks, then we stop and look. One piece at a time.' },
      { id: 'instructions', emoji: '🗣️', label: 'Following instructions', skill: 'What to say so one instruction lands', childLine: 'Wait, what?', parentLine: "One thing: shoes on. I'll wait while you do that." },
      { id: 'transitions', emoji: '⏱️', label: 'Transitions', skill: 'What to say before a transition', childLine: "I'm not done.", parentLine: "Two minutes, then we switch. I'll tell you when the two minutes end." },
      { id: 'still', emoji: '🤸', label: 'Sitting still', skill: 'What to say when {name} needs to move', childLine: 'I have to get up.', parentLine: 'Your body can move. Stand, shake it out, then come back for the next bit.' },
    ],
    routines: {
      little: { morning: 'A picture checklist for getting dressed', afternoon: 'A short play burst, then one calm task', evening: 'Tomorrow\'s clothes picked together' },
      growing: { morning: 'A three-step morning checklist', afternoon: 'Movement, then a 10-minute start', evening: 'Bag and clothes ready before bed' },
      bigger: { morning: 'Their checklist, you nearby', afternoon: 'Homework started with a timer', evening: 'A two-minute preview of tomorrow' },
    },
    connectionPrompt: 'Ask {name} which part of the day feels the most scrambled.',
    why: 'Focus is easier for {name} when the next step is small and the body has somewhere to put its energy.',
    routineAnchor: 'the next transition',
    tinyStep: {
      little: 'Point to one picture on the checklist and do only that step with {name}.',
      growing: 'Set a 10-minute timer and sit with {name} for the start, not the whole task.',
      bigger: 'Ask {name} to name the first ten minutes, then leave the rest for later.',
    },
    hotScenario: 'Homework meltdown',
  },
  {
    id: 'emotional',
    emoji: '❤️',
    title: 'Emotional wellbeing',
    topic: 'big feelings',
    tint: colors.roseSoft,
    painPrompt: 'What do hard moments usually look like with {name}?',
    pains: [
      { id: 'meltdown', emoji: '😭', label: 'Meltdowns', evening: 'A calm-down spot, used before bedtime', weekly: 'Practice the calm-down spot once a day, 4 days' },
      { id: 'worry', emoji: '😟', label: 'Worry that spirals', evening: 'A worry download before bed', weekly: 'A 5-minute worry download, 4 nights' },
      { id: 'anger', emoji: '😡', label: 'Big anger', evening: 'A cool-off plan for after dinner', weekly: 'Name the feeling before the fix, 4 times' },
      { id: 'shutdown', emoji: '😶', label: 'They shut down', evening: 'Quiet company, no questions yet', weekly: 'Sit nearby without fixing, 3 hard moments' },
      { id: 'bedtime', emoji: '🌙', label: 'Big feelings at bedtime', evening: 'Feelings first, then the routine', weekly: 'One feeling question before lights out, 4 nights' },
    ],
    nichePrompt: 'What does a hard moment usually look like?',
    niches: [
      { id: 'meltdown', emoji: '😭', label: 'Meltdown', skill: 'What to say in the middle of a meltdown', childLine: "I can't stop!", parentLine: "I'm here. You don't have to calm down fast. I'll stay until the wave gets smaller." },
      { id: 'shutdown', emoji: '😶', label: 'Shutdown', skill: 'What to say when {name} goes quiet', childLine: '…', parentLine: "You don't have to talk yet. I'll sit here until you're ready." },
      { id: 'worry', emoji: '😟', label: 'Worry', skill: 'What to say when worry takes over', childLine: 'What if something bad happens?', parentLine: "That worry is loud. Let's name it, then pick one thing we can do tonight." },
      { id: 'anger', emoji: '😡', label: 'Anger', skill: 'What to say when {name} is furious', childLine: 'I hate this!', parentLine: "You're really angry. I'm not going to argue while it's this hot. I'll stay close." },
      { id: 'bedtime', emoji: '🌙', label: 'Big feelings at bedtime', skill: 'What to say when feelings spill out at bedtime', childLine: "Today was the worst.", parentLine: "There's room for that before sleep. Tell me one part, then we'll do the routine." },
    ],
    routines: {
      little: { morning: 'A feelings check with faces', afternoon: 'A cozy reset after a big feeling', evening: 'Name one feeling before bed' },
      growing: { morning: 'A one-word check-in', afternoon: 'After-school snack, then feelings', evening: 'A short worry or win before bed' },
      bigger: { morning: 'They name how the day might feel', afternoon: 'Ten quiet minutes after school', evening: 'A feelings download, then lights out' },
    },
    connectionPrompt: 'Ask {name} what feeling showed up most today. Accept one word.',
    why: '{name} can borrow your calm faster than they can follow a lecture while the feeling is still big.',
    routineAnchor: 'the calm-down moment',
    tinyStep: {
      little: 'Sit on the floor with {name} and name the feeling before you fix anything.',
      growing: 'Offer the calm-down spot and stay nearby without adding a consequence yet.',
      bigger: 'Ask {name} if they want space or company, then do only that.',
    },
    hotScenario: 'Tantrum',
  },
  {
    id: 'school',
    emoji: '📚',
    title: 'School & learning',
    topic: 'school',
    tint: colors.yellowSoft,
    painPrompt: "What's the hardest part of school for {name} right now?",
    pains: [
      { id: 'going', emoji: '🎒', label: 'Getting out the door', evening: 'Tomorrow packed tonight', weekly: 'Pack the bag the night before, 4 evenings' },
      { id: 'homework', emoji: '✏️', label: 'Homework battles', evening: 'Homework started before dinner', weekly: 'A 15-minute homework start, 4 days' },
      { id: 'friends', emoji: '👥', label: 'Friend trouble', evening: 'A no-fix listening time', weekly: 'Ask about one friend moment, 4 days' },
      { id: 'focus', emoji: '🧩', label: 'Focusing at school', evening: 'A movement break after school', weekly: 'Move first, then one school task, 4 days' },
      { id: 'confidence', emoji: '🌱', label: 'Confidence about school', evening: 'One specific thing that went okay', weekly: 'Name one school win, 5 days' },
    ],
    nichePrompt: "What's the hardest part of school right now?",
    niches: [
      { id: 'going', emoji: '🎒', label: 'Getting there', skill: 'What to say when {name} doesn\'t want to go', childLine: "I'm not going.", parentLine: "School is still the plan. We'll do the first step together: shoes." },
      { id: 'homework', emoji: '✏️', label: 'Homework', skill: 'What to say when homework becomes a fight', childLine: 'This is stupid.', parentLine: "We can hate it and still start. Ten minutes, then a break." },
      { id: 'friends', emoji: '👥', label: 'Friends', skill: 'What to say about a hard friend moment', childLine: 'Nobody played with me.', parentLine: "That hurts. Tell me what happened, and I won't jump to fixing it." },
      { id: 'focus', emoji: '🧩', label: 'Focusing in class', skill: 'What to say after a hard focus day', childLine: 'I got in trouble for not listening.', parentLine: "One hard day isn't the whole story. What was the first moment it got slippery?" },
      { id: 'confidence', emoji: '🌱', label: 'School confidence', skill: 'What to say when {name} feels behind', childLine: "I'm bad at this.", parentLine: "You're not bad at it. You're at the part that isn't easy yet. Show me one piece." },
    ],
    routines: {
      little: { morning: 'A goodbye ritual at the door', afternoon: 'Play before any school talk', evening: 'Bag by the door' },
      growing: { morning: 'A three-step leaving routine', afternoon: 'Snack, then one school question', evening: 'Bag packed before screens' },
      bigger: { morning: 'They run the leaving checklist', afternoon: 'Decompress, then homework start', evening: 'A two-minute look at tomorrow' },
    },
    connectionPrompt: 'Ask {name} one thing about school that was okay, not the whole day.',
    why: 'School stress drops when {name} knows the first step, and when home isn\'t another classroom.',
    routineAnchor: 'the after-school landing',
    tinyStep: {
      little: 'Do the goodbye ritual once, the same way, and stop there.',
      growing: 'Ask one school question after a snack, then drop it.',
      bigger: 'Set a 15-minute start with {name} and leave the rest unfinished on purpose.',
    },
    hotScenario: 'School refusal',
  },
  {
    id: 'behaviour',
    emoji: '🤝',
    title: 'Better behaviour',
    topic: 'hard moments',
    tint: colors.primarySoft,
    painPrompt: 'What usually happens in the hard moment with {name}?',
    pains: [
      { id: 'listen', emoji: '👂', label: "They won't listen", evening: 'One clear ask, then wait', weekly: 'Give one instruction and wait, 5 times' },
      { id: 'back', emoji: '💬', label: 'Talking back', evening: 'A calm redo of the sentence', weekly: 'Ask for a redo instead of a lecture, 4 times' },
      { id: 'hits', emoji: '✋', label: 'Hitting or yelling', evening: 'Stop the hit, then reconnect', weekly: 'Practice the stop-and-repair, 3 moments' },
      { id: 'dawdle', emoji: '🐌', label: 'Dawdling', evening: 'A five-minute warning, then the next thing', weekly: 'Use the warning before 4 transitions' },
      { id: 'power', emoji: '⚖️', label: 'Power struggles', evening: 'Two real choices, not a debate', weekly: 'Offer two acceptable choices, 4 times' },
    ],
    nichePrompt: 'What usually happens in the hard moment?',
    niches: [
      { id: 'listen', emoji: '🙉', label: "They won't listen", skill: 'What to say when {name} isn\'t listening', childLine: 'Huh?', parentLine: 'I\'m going to say it once more, then wait. Shoes on.' },
      { id: 'back', emoji: '🙄', label: 'Talking back', skill: 'What to say when {name} talks back', childLine: "You can't make me.", parentLine: "You can be annoyed. Try that sentence again without the insult." },
      { id: 'hits', emoji: '✋', label: 'Hitting or yelling', skill: 'What to say when it gets physical or loud', childLine: 'I hit because I was mad!', parentLine: 'Hands stay with you. You can be mad, and I will help you stop the hit.' },
      { id: 'dawdle', emoji: '🐌', label: 'Dawdling', skill: 'What to say when everything takes forever', childLine: "I'm coming!", parentLine: 'Five minutes, then we leave. I\'ll start the timer now.' },
      { id: 'power', emoji: '🥊', label: 'Power struggle', skill: 'What to say in a power struggle', childLine: "I'm not doing it.", parentLine: 'You can do it now or in two minutes. Both end with the same task.' },
    ],
    routines: {
      little: { morning: 'One job, done together', afternoon: 'A reset cuddle after a hard moment', evening: 'Two choices for the last task' },
      growing: { morning: 'A short list they can see', afternoon: 'Repair after the hard moment', evening: 'One boundary, said once' },
      bigger: { morning: 'They own one morning job', afternoon: 'A redo instead of a lecture', evening: 'Two acceptable choices before bed' },
    },
    connectionPrompt: 'Ask {name} what felt unfair today, and listen without correcting it.',
    why: 'A short, repeated boundary is easier for {name} to follow than a longer explanation in the hot moment.',
    routineAnchor: 'the next transition',
    tinyStep: {
      little: 'Get on {name}\'s level, say one instruction, and wait.',
      growing: 'Offer two choices that you can actually live with.',
      bigger: 'Ask for a redo of the sentence, then move on.',
    },
    hotScenario: 'Won\'t listen',
  },
  {
    id: 'screens',
    emoji: '📱',
    title: 'Screen time',
    topic: 'screen time',
    tint: colors.blueSoft,
    painPrompt: "What's hardest about screen time with {name}?",
    pains: [
      { id: 'put-down', emoji: '📱', label: 'Getting them to put the device down', evening: 'A practiced handoff off the device', weekly: 'Rehearse the handoff, 4 times' },
      { id: 'arguments', emoji: '😤', label: 'Arguments when time is up', evening: 'Screen-time wind-down', weekly: '3 calm device handoffs' },
      { id: 'too-much', emoji: '⏰', label: 'Too much screen time overall', evening: 'A named daily stop time', weekly: 'One screen-free hour, 4 days' },
      { id: 'bedtime', emoji: '🌙', label: 'Screens before bedtime', evening: 'Screens off before the routine', weekly: 'Screens off before bed, 5 nights' },
      { id: 'meals', emoji: '🍽️', label: 'Using screens during meals', evening: 'A device-free dinner', weekly: '3 device-free dinners' },
      { id: 'limits', emoji: '📏', label: "I'm not sure what limits are appropriate", evening: 'One family screen rule', weekly: 'Write one screen rule together' },
    ],
    nichePrompt: 'What usually happens when you say “Time to put it away”?',
    niches: [
      { id: 'meltdown', emoji: '😭', label: 'Meltdown', skill: 'What to say when turning it off causes a meltdown', childLine: "No! I'm not done!", parentLine: "The show can wait. I'm staying with you while it goes off." },
      { id: 'argument', emoji: '😡', label: 'Argument', skill: 'What to say when screen time turns into an argument', childLine: "That's not fair!", parentLine: "You wanted more time. The limit still stands, and we can be annoyed and turn it off." },
      { id: 'five-more', emoji: '🙏', label: '“Five more minutes!”', skill: 'What to say when {name} asks for five more minutes', childLine: 'Five more minutes!', parentLine: "I hear you want more time. The timer is done, and I'll sit with you while it goes off." },
      { id: 'ignores', emoji: '🙈', label: 'Ignores me', skill: 'What to say when {name} ignores the cutoff', childLine: '…', parentLine: "I'm next to you now. Pause it, then hand it to me." },
      { id: 'listens', emoji: '🙂', label: 'Usually listens', skill: 'What to say when {name} handles the cutoff well', childLine: 'Okay, I\'m pausing it.', parentLine: 'You turned it off when I asked. That makes the next time easier.' },
    ],
    routines: {
      little: { morning: 'Play before any screen', afternoon: 'Ten minutes on the floor together', evening: 'Screens away before bath' },
      growing: { morning: 'Independent morning routine', afternoon: 'A 10-minute parent-child activity', evening: 'Screen-time wind-down' },
      bigger: { morning: 'Their own morning checklist', afternoon: 'After-school reset without a device', evening: 'An agreed screen cutoff' },
    },
    connectionPrompt: 'Ask {name} what they most want to watch tomorrow, then name when screen time starts.',
    why: 'A cutoff said before the show starts is easier for {name} than a surprise ending in the middle of the fun.',
    routineAnchor: 'screen-time wind-down',
    tinyStep: {
      little: 'Put the device away before bath and offer your lap instead.',
      growing: 'Set the timer where {name} can see it before the show starts.',
      bigger: 'Agree the stop time with {name} before the device comes out.',
    },
    hotScenario: 'Screen-time argument',
  },
  {
    id: 'communication',
    emoji: '💬',
    title: 'Communication',
    topic: 'hard conversations',
    tint: colors.lavenderSoft,
    painPrompt: 'Which conversations feel hardest with {name}?',
    pains: [
      { id: 'feelings', emoji: '💗', label: 'Talking about feelings', evening: 'One feeling question at bedtime', weekly: 'Ask one feeling question, 4 nights' },
      { id: 'school', emoji: '🏫', label: 'Talking about school', evening: 'A no-interrogation check-in', weekly: 'One school question, 4 afternoons' },
      { id: 'discipline', emoji: '🚧', label: 'Talking during discipline', evening: 'Repair after the limit', weekly: 'A one-sentence repair, 3 moments' },
      { id: 'siblings', emoji: '👫', label: 'Sibling conflict', evening: 'Each child gets one turn', weekly: 'Hear both sides before a fix, 3 times' },
      { id: 'silence', emoji: '🤐', label: 'Silence and “I don’t know”', evening: 'Company without more questions', weekly: 'Sit with the silence, 3 times' },
    ],
    nichePrompt: 'What conversation feels hardest?',
    niches: [
      { id: 'feelings', emoji: '💗', label: 'Feelings', skill: 'How to start a feelings conversation with {name}', childLine: "I don't want to talk about it.", parentLine: "You don't have to explain it all. Was it a mad, sad, or worried kind of day?" },
      { id: 'school', emoji: '🏫', label: 'School', skill: 'How to ask about school without a shutdown', childLine: 'School was fine.', parentLine: "Fine can mean a lot. What was one moment that wasn't boring?" },
      { id: 'discipline', emoji: '🚧', label: 'During discipline', skill: 'What to say after you\'ve held a limit', childLine: "You don't even care.", parentLine: "I care, and the limit stays. When you're ready, we can talk about the hard part." },
      { id: 'siblings', emoji: '👫', label: 'Siblings', skill: 'What to say in a sibling fight', childLine: 'They started it!', parentLine: "I'll hear each of you. One sentence each, then we pick a next step." },
      { id: 'silence', emoji: '🤐', label: '“I don’t know”', skill: 'What to say when {name} goes quiet', childLine: "I don't know.", parentLine: "I don't know is allowed. I can wait, or we can draw it instead of talking." },
    ],
    routines: {
      little: { morning: 'Name the plan for the day in one sentence', afternoon: 'Play beside them, then one question', evening: 'A feeling face before bed' },
      growing: { morning: 'A one-line preview of the day', afternoon: 'Snack first, question second', evening: 'One question, then the routine' },
      bigger: { morning: 'They tell you one thing they need today', afternoon: 'A ride-home or walk check-in', evening: 'An optional talk, with a stop time' },
    },
    connectionPrompt: 'Ask {name} one question, then wait longer than feels natural.',
    why: 'Kids talk more when the question is small and the silence after it is safe.',
    routineAnchor: 'the evening check-in',
    tinyStep: {
      little: 'Offer two feeling faces and let {name} point.',
      growing: 'Ask one question and don\'t add a second one.',
      bigger: 'Say you\'re available for ten minutes, then stop prompting.',
    },
    hotScenario: 'They won\'t talk',
  },
  {
    id: 'confidence',
    emoji: '🌱',
    title: 'Confidence',
    topic: 'confidence',
    tint: colors.yellowSoft,
    painPrompt: 'Where does confidence dip most for {name}?',
    pains: [
      { id: 'new', emoji: '✨', label: 'Trying new things', evening: 'A tiny first try before bed talk', weekly: 'One tiny new try, 3 days' },
      { id: 'mistakes', emoji: '💥', label: 'After a mistake', evening: 'A mistake story from you', weekly: 'Share one small mistake of your own, 3 times' },
      { id: 'friends', emoji: '👋', label: 'With friends', evening: 'Rehearse one friendly sentence', weekly: 'Practice one sentence, 3 times' },
      { id: 'school', emoji: '📝', label: 'At school', evening: 'One specific effort you noticed', weekly: 'Name effort, not talent, 5 days' },
      { id: 'speak', emoji: '🎤', label: 'Speaking up', evening: 'Practice the sentence at home', weekly: 'Rehearse speaking up, 3 times' },
    ],
    nichePrompt: 'Where does confidence dip most?',
    niches: [
      { id: 'new', emoji: '🆕', label: 'Trying new things', skill: 'What to say when {name} won\'t try', childLine: "I'll be bad at it.", parentLine: "New things feel wobbly. You only have to try the first minute." },
      { id: 'mistakes', emoji: '💥', label: 'After a mistake', skill: 'What to say after {name} messes up', childLine: "I ruined it.", parentLine: "A mistake means you were in the middle of learning. Let's look at the next try." },
      { id: 'friends', emoji: '👋', label: 'With friends', skill: 'What to say before a friend worry', childLine: 'What if they don\'t want me?', parentLine: "You can join with one sentence. Want to practice it with me first?" },
      { id: 'school', emoji: '📝', label: 'At school', skill: 'What to say when {name} feels behind', childLine: 'Everyone else gets it.', parentLine: "You're comparing the middle of your try to the end of theirs. Show me the part you did." },
      { id: 'speak', emoji: '🎤', label: 'Speaking up', skill: 'What to say when {name} freezes', childLine: 'I can\'t say it.', parentLine: "We can practice here. Your voice doesn't have to be loud to count." },
    ],
    routines: {
      little: { morning: 'A “you can try” send-off', afternoon: 'Celebrate the try, not the result', evening: 'Retell one brave moment' },
      growing: { morning: 'They name one thing they\'ll try', afternoon: 'Notice effort in one sentence', evening: 'A tiny rehearsal for tomorrow' },
      bigger: { morning: 'They pick the hard thing, you don\'t', afternoon: 'Ask what they tried, not what they won', evening: 'One sentence they might say tomorrow' },
    },
    connectionPrompt: 'Ask {name} about one thing they tried, even if it didn\'t work.',
    why: 'Confidence grows when {name} hears you notice the try, not when they hear they\'re smart.',
    routineAnchor: 'the brave-try moment',
    tinyStep: {
      little: 'Narrate one try you saw: “You kept going.”',
      growing: 'Ask {name} to try for one minute, then stop while it still feels okay.',
      bigger: 'Help {name} write the sentence they wish they\'d said.',
    },
    hotScenario: "I can't do it",
  },
  {
    id: 'connection',
    emoji: '👨‍👩‍👧',
    title: 'Family connection',
    topic: 'connection',
    tint: colors.roseSoft,
    painPrompt: 'When do you most want more connection with {name}?',
    pains: [
      { id: 'mornings', emoji: '🌅', label: 'Mornings are too rushed', evening: 'One thing ready tonight so morning has room', weekly: 'A two-minute morning hello, 5 days' },
      { id: 'after', emoji: '🏠', label: 'After school we miss each other', evening: 'Ten minutes before anything else', weekly: 'Special time after school, 4 days' },
      { id: 'meals', emoji: '🍽️', label: 'Meals feel disconnected', evening: 'A device-free question at dinner', weekly: 'One table question, 4 dinners' },
      { id: 'bedtime', emoji: '🌙', label: 'Bedtime is all logistics', evening: 'Five minutes of connection before the routine', weekly: 'Five unrushed minutes at bedtime, 4 nights' },
      { id: 'weekends', emoji: '🌤️', label: 'Weekends slip away', evening: 'Pick one small plan for the weekend', weekly: 'One protected hour together this weekend' },
    ],
    nichePrompt: 'When do you most want more connection?',
    niches: [
      { id: 'mornings', emoji: '🌅', label: 'Mornings', skill: 'What to say in a rushed morning', childLine: 'Hurry up!', parentLine: "I'm glad you're here. Shoes next, and I'll stay with you for this part." },
      { id: 'after', emoji: '🏠', label: 'After school', skill: 'What to say when they walk in the door', childLine: "I don't want to talk.", parentLine: "You don't have to report the day. I'm here for ten minutes whenever you want me." },
      { id: 'meals', emoji: '🍽️', label: 'Meals', skill: 'What to say to start a real dinner conversation', childLine: 'Can I be excused?', parentLine: "Before we leave the table, one rose and one thorn. I'll go first." },
      { id: 'bedtime', emoji: '🌙', label: 'Bedtime', skill: 'What to say so bedtime isn\'t only logistics', childLine: 'Are we done yet?', parentLine: "The routine can wait two minutes. What was the best small part of today?" },
      { id: 'weekends', emoji: '🌤️', label: 'Weekends', skill: 'What to say when the weekend is slipping by', childLine: "I'm bored.", parentLine: "Let's pick one thing we do together, even if it's short. You choose from two ideas." },
    ],
    routines: {
      little: { morning: 'A lap and a song before the rush', afternoon: 'Floor play with your phone away', evening: 'Five minutes of connection before bath' },
      growing: { morning: 'A two-minute hello before the checklist', afternoon: 'Ten minutes of their activity', evening: 'A question before the routine' },
      bigger: { morning: 'They choose the morning check-in', afternoon: 'Side-by-side time, talking optional', evening: 'Five unrushed minutes before lights out' },
    },
    connectionPrompt: 'Ask {name} one question about the best part of their day.',
    why: 'Connection sticks when it is short and predictable, not when it waits for a free afternoon.',
    routineAnchor: 'connection time',
    tinyStep: {
      little: 'Put the phone down and sit on the floor for two minutes.',
      growing: 'Offer ten minutes of their game with your full attention.',
      bigger: 'Ask {name} when a five-minute check-in would actually feel okay.',
    },
    hotScenario: 'We missed each other today',
  },
];

export function getGoal(id: GoalId) {
  const goal = GOALS.find((item) => item.id === id);
  if (!goal) {
    throw new Error(`Unknown goal: ${id}`);
  }
  return goal;
}

export function listGoals() {
  return GOALS;
}

export function helpOption(id: HelpStyle) {
  const option = HELP_OPTIONS.find((item) => item.id === id);
  if (!option) {
    throw new Error(`Unknown help style: ${id}`);
  }
  return option;
}
