/* eslint-disable @typescript-eslint/no-require-imports */
// Compile local TypeScript in memory so tests need no additional runtime dependency.
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  module._compile(output, filename);
};
const test = require('node:test');
const assert = require('node:assert/strict');
const { assignHabits, inspectCatalog, catalogHabit, catalogAgeGroup, isHabitDue, clusterCap } = require('../habits allocation/assign-habits.ts');
const { profileSignals } = require('../habits allocation/habit-signals.ts');
const { runChild } = require('../app/simulator/model.ts');
const goals = ['sleep','eating','focus','emotional','school','behaviour','screens','communication','confidence','connection'];
const date = new Date(2026, 9, 12);
const base = {age:7,goals:['sleep','behaviour'],date,childKey:'maya'};
const all = (a) => [...a.habits,...a.profile,...a.skills];

test('sibling habits require evidence; one-to-one time does not', () => {
  const input={...base,goals:['connection','communication','behaviour']};
  for (let day=1;day<=31;day++) {
    assert(all(assignHabits({...input,date:new Date(2026,9,day)})).every(h=>!catalogHabit(h.id).requiredSignals?.includes('siblings')));
  }
  const inspect=inspectCatalog(input);
  assert(inspect.find(h=>h.id==='habit_notice_teamwork').rejectReasons.some(x=>x.includes('siblings')));
  assert(inspect.find(h=>h.id==='habit_daily_connection_after_school').inProfilePool);
  assert(inspectCatalog({...input,signals:['siblings']}).find(h=>h.id==='habit_notice_teamwork').inProfilePool);
});

test('conditional skills require explicit circumstances, not matching goals alone',()=>{
  for(const [id,signal,age] of [['habit_bathroom_before_bed','bedwetting',7],['habit_repair_after_hurting','bullying_others',7],['habit_normalize_menstruation','period_preparation',13],['habit_child_questions_teacher_meeting','teacher_meeting',7],['habit_teen_money_this_week','choosing_phone_plan',16],['habit_dont_share_passwords','new_online_account',13]]){
    assert.equal(inspectCatalog({age,goals,date}).find(h=>h.id===id).inSkillPool,false,id);
    assert.equal(inspectCatalog({age,goals,date,signals:[signal]}).find(h=>h.id===id).inSkillPool,true,id);
  }
});

test('exact source ages override broad bands',()=>{
  for(const [id,yes,no] of [['habit_child_savings_goal',9,10],['habit_room_ready_for_sleep',3,2],['habit_praise_effort_or_strategy',10,11],['habit_read_ten_minutes',5,6]]){
    assert.equal(inspectCatalog({age:yes,goals,date}).find(h=>h.id===id).ageEligible,true,id);
    assert.equal(inspectCatalog({age:no,goals,date}).find(h=>h.id===id).ageEligible,false,id);
  }
});

test('goal selection does not invent diagnoses or specific problems',()=>{
  assert.deepEqual([...profileSignals({goals})],[]);
  const s=profileSignals({goals:['focus'],painId:'homework'});
  assert(s.has('attention_difficulty'));assert(!s.has('adhd'));assert(!s.has('anxiety'));
  assert(profileSignals({goals:['communication'],painId:'siblings'}).has('siblings'));
});

test('daily selection obeys age, due dates, context, uniqueness and cluster limits across profiles',()=>{
  for(const age of [2,3,4,5,6,7,9,10,11,12,13,16,18]) for(const goal of goals) for(const guidance of ['light','balanced','hands_on']) for(const day of [1,4,8,12,19,26]){
    const when=new Date(2026,9,day), input={age,goals:[goal],guidance,date:when};const a=assignHabits(input);
    assert.equal(new Set(a.habits.map(h=>h.id)).size,a.habits.length);
    const cap={light:2,balanced:3,hands_on:4}[guidance];
    for(const part of ['Morning','Afternoon','Evening'])assert(a.habits.filter(h=>h.defaultTime===part).length<=cap);
    for(const h of all(a)){
      const c=catalogHabit(h.id);assert(c.ageGroups.includes(catalogAgeGroup(age)),h.id);
      assert(age>=(c.minAge??2)&&age<=(c.maxAge??18),h.id);
      assert(!(c.requiredSignals?.length),h.id);
    }
    for(const h of a.habits){assert(isHabitDue(h,when),h.id);if(h.cluster)assert(a.habits.filter(x=>x.cluster===h.cluster).length<=clusterCap(h.cluster,[goal]));}
    if(guidance!=='hands_on')assert(a.habits.every(h=>!h.role.startsWith('extra:')));
    for(const h of a.skills)assert(inspectCatalog(input).find(x=>x.id===h.id).inSkillPool,h.id);
  }
});

test('all-day extras retain the chosen daypart and cannot repeat across slots',()=>{
  for(let day=1;day<=31;day++){
    const a=assignHabits({...base,goals:['focus','school'],guidance:'hands_on',date:new Date(2026,9,day)});
    for(const h of a.habits.filter(h=>h.role.startsWith('extra:')))assert.equal(h.defaultTime,h.role.split(':')[1]);
  }
});

test('weekly family meetings occur only on their scheduled day',()=>{
  const id='habit_solve_everyday_problem';
  for(let day=1;day<=7;day++){
    const when=new Date(2026,9,day);const a=assignHabits({...base,goals:['connection'],guidance:'hands_on',date:when});
    if(!isHabitDue(catalogHabit(id),when))assert(!a.habits.some(h=>h.id===id));
  }
});

test('skills rotate only within the relevant top score band',()=>{
  for(let week=0;week<52;week++){
    const input={...base,goals:['screens'],date:new Date(2026,0,1+week*7)};
    const a=assignHabits(input), eligible=inspectCatalog(input).filter(h=>h.inSkillPool);
    const max=Math.max(...eligible.map(h=>h.score));
    for(const h of a.skills)assert(h.score>=max-20);
  }
});

test('routine completion does not permanently remove ongoing habits',()=>{
  const before=assignHabits(base);const id=before.habits[0].id;
  const marks=Object.fromEntries(Array.from({length:14},(_,i)=>[`maya:2026-09-${String(i+1).padStart(2,'0')}:${id}`,'ontime']));
  assert(assignHabits({...base,marks}).habits.some(h=>h.id===id));
});

test('one-time learning respects child-specific completion in every selection path',()=>{
  const h=catalogHabit('habit_same_wake_time'), frequency=h.frequency;
  try{
    h.frequency='one_time_learning';
    const when=Array.from({length:7},(_,i)=>new Date(2026,9,i+12)).find(d=>isHabitDue(h,d));
    const marks={[`maya:2026-09-01:${h.id}`]:'ontime'};
    const input={...base,date:when,marks,guidance:'hands_on'};
    assert(!assignHabits(input).habits.some(x=>x.id===h.id));
    assert(assignHabits({...input,childKey:'other'}).habits.some(x=>x.id===h.id));
  }finally{h.frequency=frequency;}
});

test('simulation uses child context, own answers and selected date',()=>{
  const family={goals:['communication'],painId:'siblings',nicheId:'siblings',guidance:'light',date:'2026-10-12'};
  const child={key:'maya',name:'Maya',age:7,own:true,goals:['sleep'],painId:'',nicheId:'',guidance:'balanced'};
  const result=runChild(family,child);assert(!result.signals.includes('siblings'));
  assert(runChild(family,{...child,contextSignals:['siblings']}).signals.includes('siblings'));
});

test('invalid ages and empty goals produce no assignments; input is deterministic',()=>{
  for(const age of [0,1,19,NaN,7.5])assert.equal(all(assignHabits({...base,age})).length,0);
  assert.equal(all(assignHabits({...base,goals:[]})).length,0);
  assert.deepEqual(assignHabits(base),assignHabits(base));
});


test('selected goals materially change the recommendations',()=>{
  const sleep=assignHabits(base), screens=assignHabits({...base,goals:['screens']});
  assert(sleep.habits.some(h=>h.category==='sleep' && h.defaultTime==='Evening'));
  assert(screens.skills.some(h=>h.id==='habit_decide_screen_stopping_point'));
  assert.notDeepEqual(sleep.habits.map(h=>h.id),screens.habits.map(h=>h.id));
});

const { PAIN_HABITS, NICHE_HABITS, concernScore } = require('../habits allocation/concern-relevance.ts');
const concernChoices = [];
for (const section of fs.readFileSync(require.resolve('../habits allocation/content.ts'), 'utf8').split(/\n  \{\n    id: '/).slice(1)) {
  const goal = section.split("'")[0];
  for (const [field, type] of [['pains', 'pain'], ['niches', 'niche']]) {
    const block = section.match(new RegExp(`${field}: \\[([\\s\\S]*?)\\n    \\]`));
    if (block) for (const match of block[1].matchAll(/id: '([^']+)'/g)) concernChoices.push({goal, type, id:match[1]});
  }
}

test('every displayed pain and niche has explicit targets that still exist in the catalog',()=>{
  assert(concernChoices.length > 90);
  for(const {goal,type,id} of concernChoices){
    const key=`${goal}:${id}`, table=type==='pain'?PAIN_HABITS:NICHE_HABITS;
    assert(table[key]?.length, `${type} ${key} has no habit mapping`);
    for(const habitId of table[key]) assert(catalogHabit(habitId), `${key}: missing ${habitId}`);
    const signals=profileSignals({goals:[goal],[type==='pain'?'painId':'nicheId']:id});
    assert(signals.has(`${type}:${key}`));
  }
});

test('changing pain changes relevant recommendations for the same child, goals and date',()=>{
  function plan(goal,painId){return assignHabits({...base,goals:[goal],signals:profileSignals({goals:[goal],painId})});}
  const mornings=plan('focus','mornings'), homework=plan('focus','homework');
  assert(mornings.habits.some(h=>h.id==='habit_visible_checklist' && h.defaultTime==='Morning'));
  assert(homework.habits.some(h=>h.id==='habit_five_minute_first_task'));
  assert.notDeepEqual(mornings.habits.map(h=>h.id),homework.habits.map(h=>h.id));
  assert(plan('sleep','fears').skills.some(h=>h.id==='habit_worry_vs_fact'));
  assert(plan('sleep','settle').skills.some(h=>h.id==='habit_three_slow_breaths'));
  assert(plan('screens','bedtime').habits.some(h=>h.id==='habit_screens_off_before_bed'));
  assert(plan('screens','meals').habits.some(h=>h.id==='habit_one_meal_together'));
});

test('pain matching preserves age, context, frequency and diversity across every pain option',()=>{
  for(const age of [2,4,7,10,15,18]) for(const {goal,id} of concernChoices.filter(c=>c.type==='pain')) for(const guidance of ['light','balanced','hands_on']){
    const signals=profileSignals({goals:[goal],painId:id});
    const a=assignHabits({...base,age,goals:[goal],signals,guidance});
    for(const h of all(a)) {
      const c=catalogHabit(h.id);
      assert(c.ageGroups.includes(catalogAgeGroup(age)) && age>=(c.minAge??2) && age<=(c.maxAge??18), `${goal}:${id} ${h.id}`);
      assert((c.requiredSignals??[]).every(s=>signals.has(s)),h.id);
    }
    for(const h of a.habits) {
      assert(isHabitDue(h,date));
      if(h.cluster) assert(a.habits.filter(x=>x.cluster===h.cluster).length<=clusterCap(h.cluster,[goal]));
    }
    assert.equal(new Set(a.habits.map(h=>h.id)).size,a.habits.length);
    for(const part of ['Morning','Afternoon','Evening']) assert(a.habits.filter(h=>h.defaultTime===part).length<=({light:2,balanced:3,hands_on:4}[guidance]));
    // At least one directly relevant suggestion whenever a target is eligible and due.
    const inspection=inspectCatalog({age,goals:[goal],signals,date});
    const available=inspection.filter(h=>PAIN_HABITS[`${goal}:${id}`].includes(h.id) && (h.inSkillPool || (h.inProfilePool && isHabitDue(catalogHabit(h.id),date))));
    if(available.length) assert([...a.habits,...a.skills].some(h=>PAIN_HABITS[`${goal}:${id}`].includes(h.id)), `${age} ${goal}:${id} ${guidance}: no targeted suggestion`);
  }
});

test('weekly rotation retains the strongest pain-specific skill',()=>{
  const signals=profileSignals({goals:['sleep'],painId:'fears'});
  for(let week=0;week<20;week++) {
    const input={...base,goals:['sleep'],signals,date:new Date(2026,0,1+7*week)};
    const eligible=inspectCatalog(input).filter(h=>h.inSkillPool).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
    assert(concernScore(eligible[0].id,signals)>0);
    assert(assignHabits(input).skills.some(h=>h.id===eligible[0].id));
  }
});

test('simulator applies changed family pains and preserves child-specific answers',()=>{
  const family={goals:['focus'],painId:'mornings',nicheId:'',guidance:'balanced',date:'2026-10-13'};
  const child={key:'maya',name:'Maya',age:7,own:false,goals:['focus'],painId:'homework',nicheId:'',guidance:'balanced'};
  const a=runChild(family,child), b=runChild({...family,painId:'homework'},child);
  assert.notDeepEqual(a.assignment.habits.map(h=>h.id),b.assignment.habits.map(h=>h.id));
  assert.deepEqual(runChild(family,{...child,own:true}).assignment,runChild({...family,painId:'still'},{...child,own:true}).assignment);
});

test('age progressions change titles and actions at boundaries without changing habit identity',()=>{
  const id='habit_visible_checklist';
  const copy=age=>inspectCatalog({age,goals:['focus'],date}).find(h=>h.id===id);
  assert.equal(copy(8).title,catalogHabit(id).title);
  for(const [low,high] of [[9,12],[13,15],[16,18]]) {
    assert.equal(copy(low).title,copy(high).title);
    assert.notEqual(copy(low).title,copy(low-1).title);
    assert.notEqual(copy(low).description,copy(low-1).description);
  }
  for(const age of [8,9,12,13,15,16,18]) {
    const signals=profileSignals({goals:['focus'],painId:'mornings'});
    const a=assignHabits({...base,age,goals:['focus'],signals});
    const assigned=a.habits.find(h=>h.id===id);
    assert(assigned,`morning checklist missing at ${age}`);
    assert.equal(assigned.title,copy(age).title);
    assert.equal(assigned.description,copy(age).description);
    assert.equal(assigned.defaultTime,'Morning');
  }
});

test('every age version has non-overlapping ranges and source provenance',()=>{
  const catalog=require('../habits allocation/daily-habits.json');
  assert(catalog.some(h=>h.ageVersions?.length));
  for(const h of catalog) {
    for(const v of h.ageVersions??[]) {
      assert(v.minAge<=v.maxAge && v.minAge>=2 && v.maxAge<=18);
      assert(v.title && v.subtitle && v.description && v.sources.length);
      assert(v.sources.every(s=>s.startsWith('https://')));
    }
    for(let age=2;age<=18;age++) assert((h.ageVersions??[]).filter(v=>age>=v.minAge&&age<=v.maxAge).length<=1);
  }
});

test('age-appropriate versions are consistent in daily habits, skills, profile and inspection',()=>{
  for(const age of [8,9,12,13,15,16,18]) for(const [goal,painId] of [['focus','homework'],['sleep','inconsistent'],['screens','limits'],['emotional','worry'],['connection','after'],['eating','new']]) {
    const signals=profileSignals({goals:[goal],painId});
    const a=assignHabits({...base,age,goals:[goal],signals});
    const inspection=inspectCatalog({age,goals:[goal],signals,date});
    for(const h of all(a)) {
      const row=inspection.find(r=>r.id===h.id);
      assert.equal(h.title,row.title);assert.equal(h.subtitle,row.subtitle);assert.equal(h.description,row.description);
    }
  }
});


test('self-care copy switches to the older-child version above age eight',()=>{
  for(const id of ['habit_wash_hands_coming_home','habit_brush_teeth_twice']) {
    for(const age of [8,9,12,13,18]) {
      const row=inspectCatalog({...base,age}).find(h=>h.id===id);
      assert(row);
      const habit=catalogHabit(id);
      const expected=age<=8 ? habit : habit.ageVersions.find(v=>age>=v.minAge&&age<=v.maxAge);
      assert(expected);
      assert.equal(row.title,expected.title);
      assert.equal(row.description,expected.description);
      if(age>8) assert.notEqual(row.title,habit.title);
    }
  }
});
