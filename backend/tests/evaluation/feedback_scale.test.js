// The answers of the none-sales feedback form: five points, from Always (5) to Never (1). The frontend file is read as text.
const fs = require('fs')
const path = require('path')

const composable = fs.readFileSync(path.join(__dirname, '../../../frontend/composables/useNoneSalesFeedbackQuestions.js'), 'utf8')
const form = fs.readFileSync(path.join(__dirname, '../../../frontend/components/NoneSalesFeedbackFormComponent.vue'), 'utf8')

describe('none-sales feedback scale', () => {
    test('five answers, Always 5 to Never 1', () => {
        const scale = [...composable.matchAll(/\{ label: '(\w+)', score: (\d) \}/g)].map(match => [match[1], Number(match[2])])
        expect(scale).toEqual([['Always', 5], ['Usually', 4], ['Often', 3], ['Seldom', 2], ['Never', 1]])
    })

    test('the old three answers are not used anymore', () => {
        expect(composable).not.toMatch(/Yes, always|Yes, sometimes|No, not at all/)
    })

    test('the form shows radio buttons only: no score next to the answers', () => {
        expect(form).not.toMatch(/pts\)/)
        expect(form).toMatch(/type="radio"/)
    })
})

describe('none-sales feedback: the competency format (CSD and Collection, the head rates the member)', () => {
    test('the questions of CSD / Collection are built as competencies with their own ids (101 and up)', () => {
        expect(composable).toMatch(/csdCollectionMemberQuestions = buildCompetencies\(\[/)
        expect(composable).toMatch(/COMPETENCY_ID_START = 101/)
    })

    test('the member-rates-head form keeps the radio layout', () => {
        expect(composable).toMatch(/headQuestions = buildQuestions\(\[/)
    })

    test('Purchasing keeps its own statements (16, ids 1 - 16) and only uses the score table format', () => {
        expect(composable).toMatch(/purchasingMemberQuestions = buildQuestions\(\[/)
        expect(composable).toMatch(/\], \{ asTable: true \}\)/)
        expect(composable).not.toMatch(/purchasingMemberQuestions = csdCollectionMemberQuestions/)
        const block = composable.split('const purchasingMemberQuestions = buildQuestions([')[1].split('], { asTable: true })')[0]
        const statements = block.split('\n').map(line => line.trim()).filter(line => line.startsWith('"The employee'))
        expect(statements).toHaveLength(16)
        expect(block).not.toMatch(/LEADERSHIP/)
    })

    test('the form: COMPETENCY and SCORE columns, a score from 5 to 1, and no comment box', () => {
        expect(form).toMatch(/COMPETENCY/)
        expect(form).toMatch(/SCORE/)
        expect(form).not.toMatch(/<textarea/)
        expect(form).toMatch(/v-if="isScoreTable"/)
        expect(form).toMatch(/v-else class="overflow-x-auto"/)
    })
})

describe('none-sales feedback: the LEADERSHIP competency only for leaders', () => {
    const page = fs.readFileSync(path.join(__dirname, '../../../frontend/pages/feedback/feedback_by_nonesales/[feedback_type].vue'), 'utf8')
    const summary = fs.readFileSync(path.join(__dirname, '../../../frontend/components/NoneSalesFeedbackSummaryComponent.vue'), 'utf8')

    test('the leaders are the assistant team leader (7), team leader (8) and assistant manager (9)', () => {
        expect(composable).toMatch(/LEADER_LEVELS = \[7, 8, 9\]/)
    })

    test('LEADERSHIP is a leader only competency, after the others (the others keep their ids)', () => {
        expect(composable).toMatch(/\], \[\s*\/\/[^\n]*\n\s*"LEADERSHIP /)
        expect(composable).toMatch(/leaderOnly: index >= texts.length/)
        expect(composable).toMatch(/filter\(question => !question\.leaderOnly \|\| isLeader\)/)
    })

    test('the leader filter runs for every department; Purchasing has no leader only question, so it is not changed', () => {
        expect(composable).toMatch(/departmentCode === 'purchasing' \? purchasingMemberQuestions : csdCollectionMemberQuestions/)
        expect(composable).toMatch(/memberQuestionsOf\(departmentCode\)\.filter\(question => !question\.leaderOnly \|\| isLeader\)/)
        expect(composable).toMatch(/return \{ questions, usesReceiverLevel \}/)
    })

    test('the page reads the position of the member from the server for the giver, the admin gets it in the link', () => {
        expect(page).toMatch(/fetchEmployees\(\{ feedback_type: 'by_head' \}/)
        expect(page).toMatch(/isViewer \? \(Number\(route\.query\.who_receive_position_level\)/)
        expect(page).toMatch(/&& receiverLevelLoaded/)
        expect(summary).toMatch(/who_receive_position_level: employee\.position_level/)
    })
})
