import { computed, unref } from 'vue'

// Feedback questions for the none-sales departments (csd, collection, purchasing, hradmin). HR & Admin uses the questions of CSD / Collection.
// Same direction names as useFeedbackQuestions (sales):
//   agent_by_lm  -> immediate head rates the member   (agentType 1)
//   lm_by_agent  -> member rates the immediate head   (agentType 0)
const NONE_SALES_DEPARTMENTS = ['csd', 'collection', 'purchasing', 'hradmin']

// The answers of a feedback question, from the best to the worst (the score is what is saved and averaged).
export const NONE_SALES_FEEDBACK_SCALE = [
    { label: 'Always', score: 5 },
    { label: 'Usually', score: 4 },
    { label: 'Often', score: 3 },
    { label: 'Seldom', score: 2 },
    { label: 'Never', score: 1 },
]

// The members who are rated with the leadership competency: assistant team leader (7), team leader (8), assistant manager (9).
export const LEADER_LEVELS = [7, 8, 9]

// receiverLevel (a number or a ref): the position level of the member who receives the feedback (the head rates the member)
export function useNoneSalesFeedbackQuestions(agentType, direction, department, receiverLevel = null) {

    // Same 5 point scoring on every question (the form shows the labels only, not the scores).
    // Feedback saved before this scale (5 Yes always / 3 Yes sometimes / 1 No) keeps its numbers.
    const buildQuestions = (texts) => texts.map((text, index) => ({
        id: index + 1,
        text,
        choices: NONE_SALES_FEEDBACK_SCALE.map(choice => ({ ...choice }))
    }))

    // Competency form (the performance evaluation format): each item is written "TITLE description". The ALL CAPS words at the
    // start are the title, the rest is the description. The form shows a COMPETENCY and a SCORE (5 4 3 2 1) column, no comment.
    // The ids start at 101: the answers saved with the old questions (ids 1 - 21) never show under a competency.
    // leaderTexts: competencies that are asked only when the member who is rated is a leader (they continue the ids of the others)
    const COMPETENCY_ID_START = 101
    const buildCompetencies = (texts, leaderTexts = []) => [...texts, ...leaderTexts].map((text, index) => {
        const words = text.trim().split(/\s+/)
        let titleWords = 0
        while (titleWords < words.length && words[titleWords] === words[titleWords].toUpperCase() && /[A-Z/]/.test(words[titleWords])) titleWords++
        return {
            id: COMPETENCY_ID_START + index,
            title: words.slice(0, titleWords).join(' '),
            description: words.slice(titleWords).join(' '),
            text,
            leaderOnly: index >= texts.length,
            choices: NONE_SALES_FEEDBACK_SCALE.map(choice => ({ ...choice }))
        }
    })

    // CSD and Collection: immediate head rates the member
    const csdCollectionMemberQuestions = buildCompetencies([
        // "The employee consistently meets performance targets.",
        // "The employee follows company rules, policies, and manager’s instructions.",
        // "The employee handles customer inquiries efficiently.",
        // "The employee ensures accuracy and pays attention to detail when providing information to customers.",
        // "The employee understands job functions, processes, and systems used at work.",
        // "The employee responds immediately to concerns raised by customers or managers.",
        // "The employee finishes assigned tasks on time and ensures quality of work.",
        // "The employee communicates clearly and concisely.",
        // "The employee is open to feedback and willing to improve.",
        // "The employee demonstrates effort to learn and improve performance.",
        // "The employee stays focused when faced with distractions, obstacles, or adversity.",
        // "The employee maintains a positive and empathetic tone during interactions.",
        // "The employee treats managers and colleagues with respect.",
        // "The employee cooperates with management projects, events, and inquiries.",
        // "The employee manages time well while balancing multiple tasks.",
        // "The employee contributes positively to team morale and culture.",
        // "The employee shows initiative in learning new skills or processes.",
        // "The employee adapts well to changes in procedures or customer needs.",
        // "The employee contributes to overall customer satisfaction.",
        // "The employee demonstrates the ability to identify and solve problems while working effectively with minimal supervision.",
        // "The employee promptly informs managers of absences, tardiness, and any work-related concerns.",

        "SERIVCE ATTITUDE Level of commitment that employee has been able to manifest in terms of living up to the Company’s vision of providing service excellence to the Company’s external and internal customers.",
        "TASK ACCOMPLISHMENT The extent to which the employee is able to accomplish all of the results, output, and special assignments expected of him/her",
        "COMPREHENSION OF CONCEPT, THEORIES AND PRINCIPLES Employee exhibits understanding and mastery of principles, concepts and theories taught; ability to relate principles to practical situations and knows the",
        "TASK COMPETENCE Employee applies skills and knowledge to achieve tasks at hand; organizes work methodically; pays attention to details; implements action thoroughly towards goals.",
        "INTERPERSONAL COMPETENCE Employee exhibits ability to communicate, listen, express him/herself clearly and accurately; influences others positively, cooperates and supports efforts in building teamwork. He/She offers to assist and help co-workers in learning new task and meeting deadlines",
        "PERSONAL COMPETENCE Employee possesses high energy and willing to perform assigned task. He/She is able manage stress and adapt to changes in his/her job easily manifests positive work attitude everyday",
        "PROFESSIONALISM AND DECORUM The employee demonstrates the highest level of professionalism through speech, actions, and overall conduct. This includes reporting to work on time, and consistently adhering to ethical and compliance requirements, particularly in relation to sales conduct and other company policies.",
        "VALUES / CHARACTER Employee able to set and maintain high standards and norms in the practice of his/her profession. Ability to exemplify the corporate values such as commitment to excellence, esprit d’ corps, integrity,",
    ], [
        // only when the member who is rated is a leader (see LEADER_LEVELS)
        "LEADERSHIP Employee demonstrates strong leadership skills – such as decision making accountability, communication and ability to inspire and guide the team toward achieving goals",
    ])

    // Purchasing: immediate head rates the member
    const purchasingMemberQuestions = buildQuestions([
        "The employee consistently meets performance targets.",
        "The employee follows company rules, policies, and manager’s instructions.",
        "The employee cooperates with management projects, events, and inquiries.",
        "The employee contributes positively to team morale and culture.",
        "The employee shows initiative in learning new skills or processes.",
        "The employee treats managers and colleagues with respect.",
        "The employee demonstrates effort to learn and improve performance.",
        "The employee is open to feedback and willing to improve.",
        "The employee communicates clearly and concisely.",
        "The employee finishes assigned tasks on time and ensures quality of work.",
        "The employee responds immediately to concerns raised by managers.",
        "The employee understands job functions, processes, and systems used at work.",
        "The employee ensures all tasks, data entries, translations, and information are consistently accurate and free of errors.",
        "The employee stays focused when faced with distractions, obstacles, or adversity.",
        "The employee demonstrates the ability to identify and solve problems while working effectively with minimal supervision.",
        "The employee promptly informs managers of absences, tardiness, and any work-related concerns.",
    ])

    // All none-sales departments: member rates the immediate head
    const headQuestions = buildQuestions([
        // "The manager shows care for the team’s success.",
        // "The manager consistently meets performance targets.",
        // "The manager cooperates with management projects, events, and inquiries.",
        "The manager responds immediately to concerns raised by customers or team members.",
        "The manager gives clear instructions when assigning tasks.",
        "The manager implements policies fairly across the team.",
        "The manager treats colleagues and subordinates with respect.",
        "The manager listens to and accepts constructive criticism without unfavorable responses.",
        "The manager advocates for their subordinates’ growth and development.",
        "The manager recognizes and rewards good performance.",
        "The manager provides coaching and mentoring when needed.",
        // "The manager demonstrates strong knowledge of job functions, processes, and systems.",
        "The manager makes sound and timely decisions.",
        "The manager sets clear expectations and performance standards.",
        // "The manager is available and approachable when needed.",
        "The manager takes accountability for team outcomes.",
        "The manager handles conflicts professionally and constructively.",
        // "The manager encourages innovation and continuous improvement.",
        // "The manager adapts well to changes in procedures, priorities, or workplace challenges.",
        "The manager demonstrates self-discipline and professionalism.",
        "The manager shows confidence in their abilities and leadership.",
        // "The manager sets a positive example as a role model for others.",
        "The manager regularly reviews performance, addresses issues, and provides constructive feedback to support improvement.",
    ])


    // Decide which set to return
    const questions = computed(() => {

        const departmentCode = String(department || '').toLowerCase()

        if (!NONE_SALES_DEPARTMENTS.includes(departmentCode)) return []

        if (agentType === 1 && direction == 'agent_by_lm') {
            if (departmentCode === 'purchasing') return purchasingMemberQuestions
            // the leadership competency only when the member who is rated is an assistant team leader, a team leader or an assistant manager
            const isLeader = LEADER_LEVELS.includes(Number(unref(receiverLevel)))
            return csdCollectionMemberQuestions.filter(question => !question.leaderOnly || isLeader)
        }
        if (agentType === 0 && direction == 'lm_by_agent') return headQuestions

        return []
    })

    return { questions }
}
