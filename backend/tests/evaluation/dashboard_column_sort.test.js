// The Individual table of the sales dashboard is sorted by a column (Excel style): ascending, descending, then the original order.
// The sorting code of the page is read as text and run here with a small fake of Vue (ref / computed).
const fs = require('fs')
const path = require('path')

const page = fs.readFileSync(path.join(__dirname, '../../../frontend/pages/dashboard.vue'), 'utf8').replace(/\r\n/g, '\n')
const start = page.indexOf('const sortKey = ref(null)')
const end = page.indexOf('const paginatedAgents')
const block = page.slice(start, end)

const getWholeNumberPercentage = (target, shipok) =>
    (Number(target) != 0 && Number(shipok) != 0) ? Math.round(((shipok / target) * 100).toFixed(2)) + '%' : '0%'

const build = (rows) => {
    const ref = (value) => ({ value })
    const computed = (getter) => ({ get value() { return getter() } })
    const code = `${block}\nreturn { sortKey, sortDirection, toggleSort, sortMark, sortedAgents }`
    return new Function('ref', 'computed', 'data', 'currentPage', 'getWholeNumberPercentage', code)(ref, computed, ref(rows), ref(3), getWholeNumberPercentage)
}

const rows = [
    { db_name: 'Bea', market_name: 'Japan', team_name: 'B', total_target: 100, total_shipok: 50 },
    { db_name: 'Ana', market_name: 'Korea', team_name: 'A', total_target: 20, total_shipok: 30 },
    { db_name: 'Cid', market_name: 'Japan', team_name: 'A', total_target: 0, total_shipok: 0 },
    { db_name: 'Dan', market_name: 'Korea', team_name: 'B', total_target: 100, total_shipok: 90 },
]
const names = (table) => table.sortedAgents.value.map(agent => agent.db_name)

describe('dashboard: sort the Individual table by a column', () => {
    test('click: ascending, then descending, then the original order; page 1 each time', () => {
        const table = build(rows)
        expect(names(table)).toEqual(['Bea', 'Ana', 'Cid', 'Dan'])

        expect(table.currentPage.value).toBe(3)
        table.toggleSort('total_target')
        expect(table.currentPage.value).toBe(1)
        expect(names(table)).toEqual(['Cid', 'Ana', 'Bea', 'Dan'])      // 0, 20, 100, 100 (equal keep the original order)
        expect(table.sortMark('total_target')).toBe('▲')

        table.toggleSort('total_target')
        expect(names(table)).toEqual(['Bea', 'Dan', 'Ana', 'Cid'])      // 100, 100, 20, 0
        expect(table.sortMark('total_target')).toBe('▼')

        table.toggleSort('total_target')
        expect(names(table)).toEqual(['Bea', 'Ana', 'Cid', 'Dan'])
        expect(table.sortMark('total_target')).toBe('')
    })

    test('shipok, percentage (the whole number of the table) and remaining units', () => {
        const table = build(rows)
        table.toggleSort('total_shipok')
        expect(names(table)).toEqual(['Cid', 'Ana', 'Bea', 'Dan'])      // 0, 30, 50, 90

        table.toggleSort('percentage')                                  // another column: starts ascending
        expect(names(table)).toEqual(['Cid', 'Bea', 'Dan', 'Ana'])      // 0%, 50%, 90%, 150%

        table.toggleSort('remaining')
        expect(names(table)).toEqual(['Ana', 'Cid', 'Dan', 'Bea'])      // -10, 0, 10, 50
    })

    test('text columns, and the list of the store is not changed', () => {
        const table = build(rows)
        table.toggleSort('market_name')
        expect(table.sortedAgents.value.map(agent => agent.market_name)).toEqual(['Japan', 'Japan', 'Korea', 'Korea'])
        table.toggleSort('db_name')
        expect(names(table)).toEqual(['Ana', 'Bea', 'Cid', 'Dan'])
        expect(rows.map(agent => agent.db_name)).toEqual(['Bea', 'Ana', 'Cid', 'Dan'])
    })

    test('the headers of the table call toggleSort', () => {
        for (const key of ['total_target', 'total_shipok', 'percentage', 'remaining', 'db_name', 'market_name', 'team_name']) {
            expect(page).toContain(`@click="toggleSort('${key}')"`)
        }
        expect(page).toMatch(/return sortedAgents\.value\?\.slice\(start, end\)/)
    })
})
