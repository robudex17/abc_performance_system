// The form of the Leadership Individual Performance (TASK | KEY PERFORMANCE INDICATORS | SCORE | COMMENTS).
// The evaluator gives a SCORE (a drop down, SCORES) and a COMMENT to every task. The result is the average of the scores (1 - 5).
//
// !! The tasks and the key performance indicators below are PLACEHOLDERS (only "Operation Support" is the real example):
// replace them with the real ones. The page loads them from the backend (GET /leadership_evaluations/tasks) and the backend
// checks that every task is answered, so this is the only place to change.
exports.LEADERSHIP_TASKS = [
    {
        task: 'Operation Support',
        indicators: 'Smooth daily operations, minimal disruptions. Efficiency in handling escalations and workflow.',
    },
    {
        task: 'Team Development and Coaching',
        indicators: 'Coaches the team regularly, develops the skills of the members and prepares them for bigger roles.',
    },
    {
        task: 'Quality and Compliance',
        indicators: 'The quality standards, the policies and the procedures are followed by the team.',
    },
    {
        task: 'Communication and Collaboration',
        indicators: 'Clear and timely communication, good coordination with the other teams and departments.',
    },
    {
        task: 'Problem Solving and Decision Making',
        indicators: 'Makes sound and timely decisions, solves problems at the root and owns the result.',
    },
    {
        task: 'Accountability and Reporting',
        indicators: 'Meets the deadlines and the targets, reports are complete and accurate, takes responsibility.',
    },
]

// the SCORE drop down (the highest is the best)
exports.LEADERSHIP_SCORES = [
    { score: 5, label: '5 - Excellent' },
    { score: 4, label: '4 - Very Good' },
    { score: 3, label: '3 - Good' },
    { score: 2, label: '2 - Needs Improvement' },
    { score: 1, label: '1 - Poor' },
]

// the positions that are evaluated (position level) and the position level of the GOM, who evaluates the CSD & Collection Manager
exports.EVALUATED_LEVELS = [7, 8, 9, 10]
exports.MANAGER_LEVEL = 10
exports.GOM_LEVEL = 15
