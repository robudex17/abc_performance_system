// The form of the Leadership Individual Performance (TASK | KEY PERFORMANCE INDICATORS | SCORE | COMMENTS), the
// "II. LEADERSHIP INDIVIDUAL PERFORMANCE" section of the SBT Performance Evaluation Form.
// The evaluator gives a SCORE (a drop down, LEADERSHIP_SCORES) and a COMMENT (explain the reason for giving the score) to every task.
// The result is the average of the scores (1 - 5).
//
// The page loads the tasks from the backend (GET /leadership_evaluations/tasks) and the backend checks that every task is
// answered (with the list of the position level of the evaluated employee), so this is the only place to change. The answers are saved with the name of the task: when a task is renamed, added
// or removed, the evaluations that were saved before have to be answered again.
const DEFAULT_TASKS = [
    {
        task: 'Operation Support',
        indicators: 'Smooth daily operations, minimal disruptions. Efficiency in handling escalations and workflow.',
    },
    {
        task: 'Team Performance Management',
        indicators: 'Ensure the teams high performance. Manage and lead the team to achieve team goals',
    },
    {
        task: 'Decision Making',
        indicators: 'Ability to make timely, sound, and fair decisions. Justify with examples of decision outcomes.',
    },
    {
        task: 'Coaching, Meeting and Performance Discussion',
        indicators: "Effectiveness of training and coaching on agent's performance.",
    },
    {
        task: 'Issue Identification & Solutions',
        indicators: "Identified problems and provide a timely and effective solutions. Problem solving impact on team's performance",
    },
    {
        task: 'Communication & Collaboration',
        indicators: 'Accuracy in relaying information, teamwork with leaders/managers',
    },
    {
        task: 'Agent Engagement',
        indicators: 'Ability to motivate, engage and build trust with agents. Ability to retain staff.',
    },
    {
        task: 'Team Compliance',
        indicators: 'Team Adherence to rules, policies, procedures',
    },
    {
        task: 'Reports, Presentation and Scorecards',
        indicators: 'Timely and accurate reporting.',
    },
    {
        task: 'Innovation and Initiative',
        indicators: 'Successfully implemented a project that has significant effect on efficiency. Contribution to process improvement',
    },
    {
        task: 'Conflict Management',
        indicators: 'Effectiveness in resolving disputes. Team harmony outcomes',
    },
    {
        task: 'Talent Development',
        indicators: 'Support for agent growth and readiness. Impact of coaching and mentoring',
    },
    {
        task: 'Strategic Thinking',
        indicators: 'Aligns team goals with department vision. Contribution to long term planning.',
    },
    {
        task: 'Accountability',
        indicators: 'Ownership of responsibilities and outcomes. Consistency in enforcing standards.',
    },
    {
        task: 'Leadership Presence',
        indicators: 'Ability to represent the team professionally in meetings and escalations. With observed influence and professionalism',
    },
]

// The form of every position level that is evaluated. A level without its own list uses DEFAULT_TASKS (the 15 tasks above).
// To give a position its own questions, put the list here: { task, indicators } like the ones above, for example
//   7: [ { task: '...', indicators: '...' }, ... ],
// (7 = assistant team leader, 8 = team leader, 9 = assistant manager, 10 = manager)
const TASKS_BY_LEVEL = {
}

exports.DEFAULT_TASKS = DEFAULT_TASKS
exports.tasksForLevel = (level) => TASKS_BY_LEVEL[Number(level)] ?? DEFAULT_TASKS

// the SCORE drop down (the highest is the best), the names are the ones of the Performance Appraisal Rating of the form
exports.LEADERSHIP_SCORES = [
    { score: 5, label: '5 - Exceptional' },
    { score: 4, label: '4 - Very Satisfactory' },
    { score: 3, label: '3 - Satisfactory' },
    { score: 2, label: '2 - Needs Improvement' },
    { score: 1, label: '1 - Poor' },
]

// the positions that are evaluated (position level) and the position level of the GOM, who evaluates the CSD & Collection Manager
exports.EVALUATED_LEVELS = [7, 8, 9, 10]
exports.MANAGER_LEVEL = 10
exports.GOM_LEVEL = 15
