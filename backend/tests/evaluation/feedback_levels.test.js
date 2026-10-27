// The feedback levels are written in two places of the frontend: the side menu of every department and the page guard
// (middleware/feedback_by_nonesales.js). If they differ, a menu item opens "Access Denied" or a user sees no item at all.
// The files are read as text (they are ES modules of the frontend).
const fs = require('fs')
const path = require('path')

const frontend = path.join(__dirname, '../../../frontend')
const read = (file) => fs.readFileSync(path.join(frontend, file), 'utf8')
const toNumbers = (text) => text.split(',').map(n => Number(n.trim())).sort((a, b) => a - b)

const MENUS = ['csdMenu', 'collectionMenu', 'purchasingMenu', 'hrMenu']

// the levels of the menu items FEEDBACK MEMBERS (by_head) and FEEDBACK HEAD (by_member) of a menu
const menuLevels = (menu, type) => {
    const lines = read(`config/${menu}.js`).split('\n')
        .filter(line => line.includes(`feedback_type=${type}`) && line.includes('allowedLevels'))
    return lines.map(line => toNumbers(line.match(/allowedLevels: \[([^\]]*)\]/)[1]))
}

const guard = read('middleware/feedback_by_nonesales.js')
const guardLevels = (type) => toNumbers(guard.match(new RegExp(`${type}: \\[([^\\]]*)\\]`))[1])

describe('feedback levels: menus and page guard', () => {
    test.each(MENUS)('%s: every feedback item has the same levels as the page guard', (menu) => {
        const byHead = menuLevels(menu, 'by_head')
        const byMember = menuLevels(menu, 'by_member')
        expect(byHead.length).toBeGreaterThan(0)
        expect(byMember.length).toBeGreaterThan(0)

        byHead.forEach(levels => {
            // purchasing: the manager (10) is in Japan and does not give it, the guard may allow more but never less
            levels.forEach(level => expect(guardLevels('by_head')).toContain(level))
        })
        byMember.forEach(levels => {
            expect(levels).toEqual(guardLevels('by_member'))
        })
    })

    test.each(MENUS)('%s: the assistant team leader (level 7) gives and receives feedback', (menu) => {
        menuLevels(menu, 'by_head').forEach(levels => expect(levels).toContain(7))
        menuLevels(menu, 'by_member').forEach(levels => expect(levels).toContain(7))
    })

    test('the page guard lets level 7 in, for both types', () => {
        expect(guardLevels('by_head')).toContain(7)
        expect(guardLevels('by_member')).toContain(7)
    })
})
