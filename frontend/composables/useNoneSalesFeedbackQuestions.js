import { computed } from 'vue'

// Feedback questions for the none-sales departments (csd, collection, purchasing).
// Same direction names as useFeedbackQuestions (sales):
//   agent_by_lm  -> immediate head rates the member   (agentType 1)
//   lm_by_agent  -> member rates the immediate head   (agentType 0)
const NONE_SALES_DEPARTMENTS = ['csd', 'collection', 'purchasing']

export function useNoneSalesFeedbackQuestions(agentType, direction, department) {

    // Same 5 / 3 / 1 scoring on every question.
    const buildQuestions = (texts) => texts.map((text, index) => ({
        id: index + 1,
        text,
        choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
        ]
    }))

    // CSD and Collection: immediate head rates the member
    const csdCollectionMemberQuestions = buildQuestions([
        "The employee consistently meets performance targets.",
        "The employee follows company rules, policies, and manager’s instructions.",
        "The employee handles customer inquiries efficiently.",
        "The employee ensures accuracy and pays attention to detail when providing information to customers.",
        "The employee understands job functions, processes, and systems used at work.",
        "The employee responds immediately to concerns raised by customers or managers.",
        "The employee finishes assigned tasks on time and ensures quality of work.",
        "The employee communicates clearly and concisely.",
        "The employee is open to feedback and willing to improve.",
        "The employee demonstrates effort to learn and improve performance.",
        "The employee stays focused when faced with distractions, obstacles, or adversity.",
        "The employee maintains a positive and empathetic tone during interactions.",
        "The employee treats managers and colleagues with respect.",
        "The employee cooperates with management projects, events, and inquiries.",
        "The employee manages time well while balancing multiple tasks.",
        "The employee contributes positively to team morale and culture.",
        "The employee shows initiative in learning new skills or processes.",
        "The employee adapts well to changes in procedures or customer needs.",
        "The employee contributes to overall customer satisfaction.",
        "The employee demonstrates the ability to identify and solve problems while working effectively with minimal supervision.",
        "The employee promptly informs managers of absences, tardiness, and any work-related concerns.",
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
        "The manager shows care for the team’s success.",
        "The manager consistently meets performance targets.",
        "The manager cooperates with management projects, events, and inquiries.",
        "The manager responds immediately to concerns raised by customers or team members.",
        "The manager gives clear instructions when assigning tasks.",
        "The manager implements policies fairly across the team.",
        "The manager treats colleagues and subordinates with respect.",
        "The manager listens to and accepts constructive criticism without unfavorable responses.",
        "The manager advocates for their subordinates’ growth and development.",
        "The manager recognizes and rewards good performance.",
        "The manager provides coaching and mentoring when needed.",
        "The manager demonstrates strong knowledge of job functions, processes, and systems.",
        "The manager makes sound and timely decisions.",
        "The manager sets clear expectations and performance standards.",
        "The manager is available and approachable when needed.",
        "The manager takes accountability for team outcomes.",
        "The manager handles conflicts professionally and constructively.",
        "The manager encourages innovation and continuous improvement.",
        "The manager adapts well to changes in procedures, priorities, or workplace challenges.",
        "The manager demonstrates self-discipline and professionalism.",
        "The manager shows confidence in their abilities and leadership.",
        "The manager sets a positive example as a role model for others.",
        "The manager regularly reviews performance, addresses issues, and provides constructive feedback to support improvement.",
    ])


    // Decide which set to return
    const questions = computed(() => {

        const departmentCode = String(department || '').toLowerCase()

        if (!NONE_SALES_DEPARTMENTS.includes(departmentCode)) return []

        if (agentType === 1 && direction == 'agent_by_lm') {
            return departmentCode === 'purchasing' ? purchasingMemberQuestions : csdCollectionMemberQuestions
        }
        if (agentType === 0 && direction == 'lm_by_agent') return headQuestions

        return []
    })

    return { questions }
}
