// Explicit relevance to the current catalog. Order indicates priority, not a
// guarantee of selection: age, context, frequency and diversity still apply.
export const PAIN_HABITS: Record<string, readonly string[]> = {
  "sleep:long": ["habit_same_three_step_bedtime", "habit_screens_off_before_bed", "habit_warn_before_transition"],
  "sleep:leaves": ["habit_same_three_step_bedtime", "habit_room_ready_for_sleep", "habit_same_wake_time"],
  "sleep:fears": ["habit_room_ready_for_sleep", "habit_worry_vs_fact", "habit_teen_sleep_without_lecture", "habit_name_the_worry"],
  "sleep:early": ["habit_same_wake_time", "habit_room_ready_for_sleep"],
  "sleep:settle": ["habit_three_slow_breaths", "habit_screens_off_before_bed", "habit_active_play_under_five", "habit_move_hour_across_day"],
  "sleep:inconsistent": ["habit_same_wake_time", "habit_same_three_step_bedtime"],
  "eating:refuses": ["habit_child_decides_how_much", "habit_one_meal_together", "habit_no_good_bad_food"],
  "eating:beige": ["habit_no_good_bad_food", "habit_fruit_or_veg_with_meal", "habit_protein_at_breakfast", "habit_prepare_part_of_meal"],
  "eating:battle": ["habit_one_meal_together", "habit_child_decides_how_much", "habit_no_punish_while_angry"],
  "eating:snacks": ["habit_child_decides_how_much", "habit_water_not_sugary", "habit_one_meal_together"],
  "eating:new": ["habit_no_good_bad_food", "habit_prepare_part_of_meal", "habit_fruit_or_veg_with_meal"],
  "eating:pressure": ["habit_child_decides_how_much", "habit_no_good_bad_food", "habit_daily_check_in"],
  "focus:homework": ["habit_five_minute_first_task", "habit_homework_spot_ready", "habit_work_then_break", "habit_estimate_how_long"],
  "focus:instructions": ["habit_one_step_then_wait", "habit_visible_checklist", "habit_estimate_how_long"],
  "focus:still": ["habit_move_before_homework", "habit_work_then_break", "habit_active_play_under_five", "habit_move_hour_across_day"],
  "focus:mornings": ["habit_visible_checklist", "habit_pack_finished_work", "habit_dress_themselves"],
  "focus:transitions": ["habit_warn_before_transition", "habit_estimate_how_long", "habit_redirect_early_frustration"],
  "emotional:meltdown": ["habit_stay_present_until_settles", "habit_name_feeling_before_reacting", "habit_no_punish_while_angry"],
  "emotional:worry": ["habit_worry_vs_fact", "habit_name_the_worry", "habit_three_slow_breaths"],
  "emotional:anger": ["habit_rate_feeling", "habit_pick_calmdown", "habit_three_slow_breaths"],
  "emotional:shutdown": ["habit_daily_check_in", "habit_teen_conversation_no_advice", "habit_daily_connection_after_school"],
  "emotional:bedtime": ["habit_teen_sleep_without_lecture", "habit_name_feeling_before_reacting", "habit_same_three_step_bedtime", "habit_three_slow_breaths"],
  "school:going": ["habit_visible_checklist", "habit_pack_finished_work", "habit_rehearse_first", "habit_dress_themselves"],
  "school:homework": ["habit_snack_water_before_homework", "habit_five_minute_first_task", "habit_leave_mistake_unfixed"],
  "school:friends": ["habit_invite_someone_to_join", "habit_teen_know_one_friend", "habit_daily_check_in", "habit_rehearse_greeting_before_play"],
  "school:focus": ["habit_homework_spot_ready", "habit_move_before_homework", "habit_work_then_break"],
  "school:confidence": ["habit_praise_effort_or_strategy", "habit_leave_mistake_unfixed", "habit_five_minute_first_task", "habit_love_you_no_performance"],
  "behaviour:listen": ["habit_one_step_then_wait", "habit_visible_checklist", "habit_replace_threat_with_boundary"],
  "behaviour:back": ["habit_disagree_respectfully", "habit_no_punish_while_angry", "habit_daily_check_in", "habit_apologize_out_loud"],
  "behaviour:hits": ["habit_say_what_you_need", "habit_stay_present_until_settles", "habit_pick_calmdown", "habit_rate_feeling"],
  "behaviour:dawdle": ["habit_visible_checklist", "habit_estimate_how_long", "habit_dress_themselves"],
  "behaviour:power": ["habit_two_acceptable_choices", "habit_no_renegotiate_boundary", "habit_compare_solutions_with_teen", "habit_daily_check_in"],
  "screens:put-down": ["habit_warn_before_transition", "habit_decide_screen_stopping_point", "habit_estimate_how_long"],
  "screens:arguments": ["habit_replace_threat_with_boundary", "habit_no_punish_while_angry", "habit_decide_screen_stopping_point"],
  "screens:too-much": ["habit_decide_screen_stopping_point", "habit_let_boredom_happen", "habit_move_hour_across_day", "habit_active_play_under_five"],
  "screens:bedtime": ["habit_screens_off_before_bed", "habit_same_three_step_bedtime", "habit_room_ready_for_sleep"],
  "screens:meals": ["habit_decide_screen_stopping_point", "habit_one_meal_together"],
  "screens:limits": ["habit_decide_screen_stopping_point", "habit_let_them_teach_you"],
  "communication:feelings": ["habit_name_feeling_before_reacting", "habit_daily_check_in", "habit_teen_conversation_no_advice"],
  "communication:school": ["habit_teen_what_excited", "habit_daily_check_in", "habit_teen_conversation_no_advice"],
  "communication:discipline": ["habit_apologize_out_loud", "habit_replace_threat_with_boundary", "habit_no_punish_while_angry"],
  "communication:siblings": ["habit_hear_each_child_first", "habit_plan_sibling_turns", "habit_notice_teamwork"],
  "communication:silence": ["habit_daily_connection_after_school", "habit_teen_conversation_no_advice", "habit_daily_check_in", "habit_describe_toddler_play"],
  "confidence:new": ["habit_small_brave_step", "habit_compare_solutions_with_teen", "habit_ten_minutes_creating"],
  "confidence:mistakes": ["habit_love_you_no_performance", "habit_leave_mistake_unfixed", "habit_apologize_out_loud", "habit_praise_effort_or_strategy"],
  "confidence:friends": ["habit_rehearse_greeting_before_play", "habit_invite_someone_to_join", "habit_teen_know_one_friend"],
  "confidence:school": ["habit_praise_effort_or_strategy", "habit_five_minute_first_task", "habit_leave_mistake_unfixed"],
  "confidence:speak": ["habit_rehearse_greeting_before_play", "habit_daily_check_in", "habit_compare_solutions_with_teen"],
  "connection:mornings": ["habit_visible_checklist", "habit_dress_themselves", "habit_daily_connection_after_school"],
  "connection:after": ["habit_daily_connection_after_school", "habit_teen_what_excited", "habit_teen_conversation_no_advice"],
  "connection:meals": ["habit_one_meal_together", "habit_prepare_part_of_meal", "habit_set_table_together"],
  "connection:bedtime": ["habit_same_three_step_bedtime", "habit_love_you_no_performance", "habit_teen_sleep_without_lecture"],
  "connection:weekends": ["habit_solve_everyday_problem", "habit_get_outside_today", "habit_helpful_without_asked", "habit_take_turns"],
};

export const NICHE_HABITS: Record<string, readonly string[]> = {
  "focus:homework": ["habit_five_minute_first_task", "habit_homework_spot_ready", "habit_work_then_break", "habit_estimate_how_long"],
  "focus:instructions": ["habit_one_step_then_wait", "habit_visible_checklist", "habit_estimate_how_long"],
  "focus:still": ["habit_move_before_homework", "habit_work_then_break", "habit_active_play_under_five", "habit_move_hour_across_day"],
  "focus:mornings": ["habit_visible_checklist", "habit_pack_finished_work", "habit_dress_themselves"],
  "focus:transitions": ["habit_warn_before_transition", "habit_estimate_how_long", "habit_redirect_early_frustration"],
  "emotional:meltdown": ["habit_stay_present_until_settles", "habit_name_feeling_before_reacting", "habit_no_punish_while_angry"],
  "emotional:worry": ["habit_worry_vs_fact", "habit_name_the_worry", "habit_three_slow_breaths"],
  "emotional:anger": ["habit_rate_feeling", "habit_pick_calmdown", "habit_three_slow_breaths"],
  "emotional:shutdown": ["habit_daily_check_in", "habit_teen_conversation_no_advice", "habit_daily_connection_after_school"],
  "emotional:bedtime": ["habit_teen_sleep_without_lecture", "habit_name_feeling_before_reacting", "habit_same_three_step_bedtime", "habit_three_slow_breaths"],
  "school:going": ["habit_visible_checklist", "habit_pack_finished_work", "habit_rehearse_first", "habit_dress_themselves"],
  "school:homework": ["habit_snack_water_before_homework", "habit_five_minute_first_task", "habit_leave_mistake_unfixed"],
  "school:friends": ["habit_invite_someone_to_join", "habit_teen_know_one_friend", "habit_daily_check_in", "habit_rehearse_greeting_before_play"],
  "school:focus": ["habit_homework_spot_ready", "habit_move_before_homework", "habit_work_then_break"],
  "school:confidence": ["habit_praise_effort_or_strategy", "habit_leave_mistake_unfixed", "habit_five_minute_first_task", "habit_love_you_no_performance"],
  "behaviour:listen": ["habit_one_step_then_wait", "habit_visible_checklist", "habit_replace_threat_with_boundary"],
  "behaviour:back": ["habit_disagree_respectfully", "habit_no_punish_while_angry", "habit_daily_check_in", "habit_apologize_out_loud"],
  "behaviour:hits": ["habit_say_what_you_need", "habit_stay_present_until_settles", "habit_pick_calmdown", "habit_rate_feeling"],
  "behaviour:dawdle": ["habit_visible_checklist", "habit_estimate_how_long", "habit_dress_themselves"],
  "behaviour:power": ["habit_two_acceptable_choices", "habit_no_renegotiate_boundary", "habit_compare_solutions_with_teen", "habit_daily_check_in"],
  "communication:feelings": ["habit_name_feeling_before_reacting", "habit_daily_check_in", "habit_teen_conversation_no_advice"],
  "communication:school": ["habit_teen_what_excited", "habit_daily_check_in", "habit_teen_conversation_no_advice"],
  "communication:discipline": ["habit_apologize_out_loud", "habit_replace_threat_with_boundary", "habit_no_punish_while_angry"],
  "communication:siblings": ["habit_hear_each_child_first", "habit_plan_sibling_turns", "habit_notice_teamwork"],
  "communication:silence": ["habit_daily_connection_after_school", "habit_teen_conversation_no_advice", "habit_daily_check_in", "habit_describe_toddler_play"],
  "confidence:new": ["habit_small_brave_step", "habit_compare_solutions_with_teen", "habit_ten_minutes_creating"],
  "confidence:mistakes": ["habit_love_you_no_performance", "habit_leave_mistake_unfixed", "habit_apologize_out_loud", "habit_praise_effort_or_strategy"],
  "confidence:friends": ["habit_rehearse_greeting_before_play", "habit_invite_someone_to_join", "habit_teen_know_one_friend"],
  "confidence:school": ["habit_praise_effort_or_strategy", "habit_five_minute_first_task", "habit_leave_mistake_unfixed"],
  "confidence:speak": ["habit_rehearse_greeting_before_play", "habit_daily_check_in", "habit_compare_solutions_with_teen"],
  "connection:mornings": ["habit_visible_checklist", "habit_dress_themselves", "habit_daily_connection_after_school"],
  "connection:after": ["habit_daily_connection_after_school", "habit_teen_what_excited", "habit_teen_conversation_no_advice"],
  "connection:meals": ["habit_one_meal_together", "habit_prepare_part_of_meal", "habit_set_table_together"],
  "connection:bedtime": ["habit_same_three_step_bedtime", "habit_love_you_no_performance", "habit_teen_sleep_without_lecture"],
  "connection:weekends": ["habit_solve_everyday_problem", "habit_get_outside_today", "habit_helpful_without_asked", "habit_take_turns"],
  "sleep:wired": ["habit_three_slow_breaths", "habit_screens_off_before_bed", "habit_active_play_under_five", "habit_move_hour_across_day"],
  "sleep:room": ["habit_same_three_step_bedtime", "habit_room_ready_for_sleep", "habit_same_wake_time"],
  "sleep:scared": ["habit_room_ready_for_sleep", "habit_worry_vs_fact", "habit_teen_sleep_without_lecture", "habit_name_the_worry"],
  "sleep:screens": ["habit_screens_off_before_bed", "habit_decide_screen_stopping_point"],
  "sleep:not-tired": ["habit_same_wake_time", "habit_morning_outside_five", "habit_move_hour_across_day"],
  "eating:under5": ["habit_child_decides_how_much", "habit_no_good_bad_food", "habit_daily_check_in"],
  "eating:five-ten": ["habit_no_good_bad_food", "habit_prepare_part_of_meal", "habit_fruit_or_veg_with_meal"],
  "eating:ten-twenty": ["habit_no_good_bad_food", "habit_fruit_or_veg_with_meal", "habit_protein_at_breakfast", "habit_prepare_part_of_meal"],
  "eating:twenty": ["habit_one_meal_together", "habit_fruit_or_veg_with_meal"],
  "screens:meltdown": ["habit_stay_present_until_settles", "habit_warn_before_transition", "habit_redirect_early_frustration"],
  "screens:argument": ["habit_replace_threat_with_boundary", "habit_no_punish_while_angry", "habit_decide_screen_stopping_point"],
  "screens:five-more": ["habit_warn_before_transition", "habit_decide_screen_stopping_point", "habit_estimate_how_long"],
  "screens:ignores": ["habit_one_step_then_wait", "habit_replace_threat_with_boundary", "habit_decide_screen_stopping_point"],
  "screens:listens": ["habit_praise_effort_or_strategy", "habit_decide_screen_stopping_point"],
};

export function concernMatches(id: string, signals: Set<string>) {
  return [...signals].filter(signal => {
    const table = signal.startsWith('pain:') ? PAIN_HABITS
      : signal.startsWith('niche:') ? NICHE_HABITS : undefined;
    return table?.[signal.slice(signal.indexOf(':') + 1)]?.includes(id) ?? false;
  });
}

export function concernScore(id: string, signals: Set<string>) {
  // Prefer the selected pain over the optional niche. Never count aliases twice.
  let pain = 0, niche = 0;
  for (const signal of concernMatches(id, signals)) {
    const isPain = signal.startsWith('pain:');
    const table = isPain ? PAIN_HABITS : NICHE_HABITS;
    const index = table[signal.slice(signal.indexOf(':') + 1)].indexOf(id);
    if (isPain) pain = Math.max(pain, 220 - index * 20);
    else niche = Math.max(niche, 70 - index * 10);
  }
  return pain + niche;
}
