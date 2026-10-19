const { isQaStaff } = require('../middleware/qa_access')

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

// The forms. The tasks above (DEFAULT_TASKS) are the form of the team leaders, the assistant team leaders and the assistant managers
// (answered by their head). The other forms are made from them:
//   STANDARD  levels 7, 8, 9  the 15 tasks above
//   MANAGER   level 10        the same tasks plus 'Staff Scheduling & Time Management' (answered by the GOM)
//   PURCHASING_LEADER  the Purchasing team leaders (answered by the Purchasing Manager): the MANAGER form with two indicators worded differently
//   PURCHASING_ASSISTANT  the Purchasing assistant team leader (answered by the Purchasing Team Leader): 15 tasks, 'Coaching, Training and
//             Performance Discussion', 'Adaptability' instead of 'Talent Development' and 'Strategic Thinking', and the Staff Scheduling task
//   QA        the Quality Analyst (answered by the CSD & Collection Manager): its own 8 tasks
const STAFF_SCHEDULING = {
    task: 'Staff Scheduling & Time Management',
    indicators: 'Demonstrates effective staff scheduling and time management, ensuring timely task completion and controlled overtime costs.',
}
const STANDARD_TASKS = DEFAULT_TASKS
const MANAGER_TASKS = DEFAULT_TASKS.flatMap(item => item.task === 'Leadership Presence' ? [STAFF_SCHEDULING, item] : [item])
const PURCHASING_LEADER_TASKS = MANAGER_TASKS.map(item => {
    if (item.task === 'Coaching, Meeting and Performance Discussion') {
        return { ...item, indicators: "Effectiveness of training and coaching on agent's performance and support team development." }
    }
    if (item.task === STAFF_SCHEDULING.task) {
        return { ...item, indicators: 'Completes tasks on time and minimizes overtime through effective staff scheduling.' }
    }
    return item
})
const PURCHASING_ASSISTANT_TASKS = PURCHASING_LEADER_TASKS
    .filter(item => !['Talent Development', 'Strategic Thinking'].includes(item.task))
    .flatMap(item => {
        if (item.task === 'Coaching, Meeting and Performance Discussion') return [{ ...item, task: 'Coaching, Training and Performance Discussion' }]
        if (item.task === 'Accountability') {
            return [{ task: 'Adaptability', indicators: 'Responsiveness to changes in systems/procedures. Flexibility and proactive communication.' }, item]
        }
        return [item]
    })
const QA_TASKS = [
    { task: 'Calls and Emails evaluation and calibration', indicators: "Compliance with standard procedure, agent's call and email quality" },
    { task: 'Report and Feedback', indicators: 'Promptness and Accuracy of report' },
    { task: 'Identify issue and provide solutions', indicators: 'Timeliness and effectiveness of solution provided' },
    { task: 'Training and Coaching', indicators: "Effectiveness of training on agent's performance and new hires readiness" },
    { task: 'Analytical Skills', indicators: 'Ability to interpret QA data and trends' },
    { task: 'Agent Engagement', indicators: 'Ability to motivate, engage and build trust with agents' },
    { task: 'Documentation Quality', indicators: 'Accuracy, Availability and completeness of QA records' },
    { task: 'Innovation and Initiative', indicators: 'Proposed and suggested ideas for efficiency that has been implemented' },
]

// the form of an evaluated employee { position_level, position_name }; the form is chosen here, never by the browser
exports.tasksFor = (employee) => {
    if (isQaStaff(employee)) return QA_TASKS
    if (Number(employee?.position_level) === 10) return MANAGER_TASKS
    if (employee?.department_code === 'purchasing' && Number(employee?.position_level) === 7) return PURCHASING_ASSISTANT_TASKS
    if (employee?.department_code === 'purchasing' && [8, 9].includes(Number(employee?.position_level))) return PURCHASING_LEADER_TASKS
    return STANDARD_TASKS
}

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
