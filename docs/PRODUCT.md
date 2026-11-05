# Product direction

LevelUp is a personal productivity platform. Tasks and recurring habits are the work;
avatars, companions, XP and rewards help people notice progress. The product should
make capture, planning, completion and correction easy before adding more reward mechanics.

The Today workspace puts quick capture and daily work first. Tasks show their due dates;
overdue and current work precede undated tasks, and future tasks have a separate upcoming
list. Recurring habits use the person's configured timezone and day-start hour. Avatar
and companion activity follows the daily plan. Detailed habit schedules and optional
reward settings remain available in the full editor.

## Next priorities

- Keep completed tasks available after the day ends. Their database records survive,
  but the current task list stops showing them the next day. A searchable completion
  history should support reviewing real work, not just reward totals.
- Make completion corrections independent of reward thresholds. The current undo rule
  can refuse a correction after an activity's XP has gone into a level-up. Decide how
  to reconcile rewards while keeping the work record editable.
- Add useful weekly progress summaries based on actual task and habit completions.
  Prioritise consistency and what needs attention over character level or currency.
- Finish production access. The deployment workflow currently requires the repository's
  `DEPLOY_HOST` and `DEPLOY_SSH_KEY` Actions secrets; it skips SSH deployment when the host
  is missing. Values belong in GitHub's secure settings.

## Product constraints

- Keep task capture free of compulsory avatar, stat or reward configuration.
- Respect calendar dates, the person's timezone and their chosen start of day.
- Preserve task text on validation failures and while an earlier capture is saving.
- Keep task titles and notes private; shared activity must never disclose them.
- Preserve saved work and existing avatar/pet ids through presentation changes.
- Treat companion customisation as optional engagement work after the core workflows.
