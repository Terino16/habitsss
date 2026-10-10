import type { ChildDraft } from './types';

export function formatChildLabel(children: ChildDraft[]) {
  const names = children.map((child) => child.name.trim()).filter((name) => name.length > 0);
  if (names.length === 0) return 'your child';
  if (names.length === 1) return names[0] ?? 'your child';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  const head = names.slice(0, -1).join(', ');
  return `${head}, and ${names[names.length - 1]}`;
}

export function possessive(label: string) {
  return label.endsWith('s') ? `${label}'` : `${label}'s`;
}

export function agePhrase(age: number) {
  const article = age === 8 || age === 11 ? 'an' : 'a';
  return `${article} ${age}-year-old`;
}

export function formatAgeLine(ages: number[]) {
  if (ages.length === 0) return 'Their age';
  if (ages.length === 1) return `Age ${ages[0]}`;
  if (ages.length === 2) return `Ages ${ages[0]} and ${ages[1]}`;
  const head = ages.slice(0, -1).join(', ');
  return `Ages ${head}, and ${ages[ages.length - 1]}`;
}

export function completedChildren(children: ChildDraft[]) {
  return children.filter((child) => child.name.trim().length > 0 && child.age != null);
}
