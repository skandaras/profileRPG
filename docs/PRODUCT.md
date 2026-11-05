# Product direction

LevelUp is a personal productivity platform. Tasks and recurring habits are the work;
avatars, companions, XP and rewards help people notice progress. The product should
make capture, planning, completion and correction easy before adding more reward mechanics.

The Today workspace puts quick capture and daily work first. Tasks show their due dates;
overdue and current work precede undated tasks, and future tasks have a separate upcoming
list. Recurring habits use the person's configured timezone and day-start hour. Avatar
and companion activity follows the daily plan. Detailed habit schedules and optional
reward settings remain available in the full editor.

History keeps completed tasks and habit check-ins accessible after the day ends,
including archived work. Search, work-type and date filters support review; each habit's
check-ins are grouped by completion day. A seven-day summary counts tasks finished,
habit check-ins and active days across all work, independently of the search filters.
These dates use the person's timezone and chosen day-start hour.

Completion corrections must succeed even when rewards have been spent or a level has
unlocked. Today's check-ins can be undone; completed one-off tasks can also be reopened
from History on later days. Reopening removes that completion, unarchives the task and
returns it to the work list with its original due date. Summary counts update with it.
XP progress is recalculated from corrected lifetime XP. Earned levels, allocated points,
learned abilities, purchases and pet growth stay unlocked; redoing corrected work cannot
award the same level-up points again. GP and training reverse as far as their existing
balances allow, without making balances negative. No schema migration is required.

## Next priorities

- Finish production access. The deployment workflow currently requires the repository's
  `DEPLOY_HOST` and `DEPLOY_SSH_KEY` Actions secrets; it skips SSH deployment when the host
  is missing. Values belong in GitHub's secure settings.
- Make first-run setup shorter for people who want to capture work immediately.
  Avatar and companion choices should remain optional to the productivity workflow.
- Review task organisation and rescheduling against real use of Today and History
  before expanding reward mechanics.

## Product constraints

- Keep task capture free of compulsory avatar, stat or reward configuration.
- Respect calendar dates, the person's timezone and their chosen start of day.
- Preserve task text on validation failures and while an earlier capture is saving.
- Keep completion records correctable independently of reward thresholds.
- Keep task titles and notes private; shared activity must never disclose them.
- Preserve saved work and existing avatar/pet ids through presentation changes.
- Treat companion customisation as optional engagement work after the core workflows.
