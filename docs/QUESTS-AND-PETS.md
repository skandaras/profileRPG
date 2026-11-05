# Quests and companions

These areas support a productivity platform. They should help someone notice their
real work, enjoy a companion and come back with a clear next action.

## First pass

Quests begin with three optional weekly targets: finish tasks, check in with habits,
and be active on a chosen number of days. People choose the target rather than receiving
a compulsory assignment. Work already logged this week counts, archived work stays
counted, and undo or task reopening corrects progress. Weeks follow the person's
timezone and day-start hour. The next week begins with fresh choices, without penalties
for unfinished targets. Prior target settings remain saved in the database.

Targets are progress markers. They do not issue extra XP or currency when selected,
reached, edited or removed; normal completion rewards remain attached to the work.
This keeps changing a target from becoming a way to claim repeated rewards.

The eight existing timed trips appear as optional expeditions below the work targets.
Their ids, durations, level gates, rewards and saved runs remain intact. The cards name
the species whose eggs can be found. A travelling companion's pet page links back to
the expedition, then changes to a collect-rewards link once the trip ends. Pets return
when rewards are claimed.

Pet care explains the loop: completed work shares growth XP with the current companion;
activities matching its affinity share more; care and expeditions also contribute.
The baby, teen and adult illustrations show the growth milestones, with XP remaining
to the next form. Care buttons become available as cooldowns expire without reloading.
Rest mode remains available to pause needs. Pet growth and forms are not lost during
absence.

Discovery hints cover Cairnback, Cloudwool and Lamplume, which can be found on expeditions.
The three starter species remain setup choices; this pass does not imply that the other
starters can already be collected later. Eggs warm through task completions and habit
check-ins, then hatch through the existing action. Hatched pets can become the companion
from the nest.

The only schema addition is `work_goals`, keyed by owner, week and target kind. Its
migration is additive. Target progress is queried from existing completion records;
it is not stored in a second counter or broadcast in the party feed.

## Questions for the next iteration

- The agreed direction is real tasks and habit goals, plus optional pet expeditions,
  with gentle optional care, activities and growth. Should the work goals next expand
  into named projects with linked checklists, recurring challenges or focus sessions?
- Food, toys and room artwork have been repainted to match the cast after the asset
  review. The current room pass uses the arched fantasy study; setting preferences can
  guide the next room revision.
- Should the other starter species become discoverable later? They currently do not
  appear in the expedition egg tables.
- Are fitted pet accessories or illustrated expedition locations the next art priority?

The next art and quest iteration should follow that feedback.
