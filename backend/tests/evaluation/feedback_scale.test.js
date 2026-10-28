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
