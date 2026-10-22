// The Excel of the Custom Range: the file is really built (header, a row, the months counted). The data of the range is mocked.
jest.mock('../../src/controllers/evaluation/custom_range_controller', () => ({
    readRequest: jest.fn(),
    getCustomRangeList: jest.fn(),
    getCustomRangeOne: jest.fn(),
}))

const { PassThrough } = require('stream')
const ExcelJS = require('exceljs')
const controller = require('../../src/controllers/evaluation/custom_range_controller')
const { exportCustomRange } = require('../../src/controllers/evaluation/custom_range_export')

// a response that collects the bytes of the file
const makeResponse = () => {
    const stream = new PassThrough()
    const chunks = []
    stream.on('data', chunk => chunks.push(chunk))
    stream.headers = {}
    stream.setHeader = (key, value) => { stream.headers[key] = value }
    stream.status = (code) => { stream.code = code; return stream }
    stream.json = (body) => { stream.body = body; return stream }
    stream.bytes = () => Buffer.concat(chunks)
    return stream
}

const averageRow = {
    start_date: '2025-11', end_date: '2026-04', months_in_range: 6, months_submitted: 4,
    db_name: 'dhen', employee_status: 'Hired', position_name: 'CSD Agent', team_name: 'Team Ahlie',
    performance: '88.50000', leadership_required: false, leadership_score: '0.00000', final_ratings: '4.2500', ratings_name: 'VERY SATISFACTORY',
}

describe('the Excel of the custom range', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        controller.readRequest.mockReturnValue({ months: ['2025-11'], department: 'csd', statuses: null })
    })

    test('the list has the range, the months counted and the rating', async () => {
        controller.getCustomRangeList.mockResolvedValue([averageRow])
        const res = makeResponse()
        await exportCustomRange({ user: { role: 'admin' }, params: {}, query: {} }, res)
        await new Promise(resolve => setImmediate(resolve))

        expect(res.headers['Content-Disposition']).toContain('csd-agents-custom-range-2025-11-2026-04.xlsx')

        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(res.bytes())
        const sheet = workbook.getWorksheet('CUSTOM-RANGE')
        expect(sheet.getRow(1).getCell(1).value).toContain('CSD AGENTS CUSTOM RANGE 2025-11 to 2026-04')
        expect(sheet.getRow(2).values.filter(Boolean)).toEqual(expect.arrayContaining(['MONTHS COUNTED', 'PERFORMANCE (%)', 'RATING', 'RATING NAME']))

        const row = sheet.getRow(3).values
        expect(row[1]).toBe('2025-11')
        expect(row[2]).toBe('2026-04')
        expect(row[3]).toBe('Dhen')
        expect(row[7]).toBe('4 / 6')                       // 4 submitted months of the 6 of the range
        expect(row[10]).toBe(4.25)
        expect(row[11]).toBe('VERY SATISFACTORY')
    })

    test('nothing to export is a 404 message', async () => {
        controller.getCustomRangeList.mockResolvedValue([])
        const res = makeResponse()
        await exportCustomRange({ user: { role: 'admin' }, params: {}, query: {} }, res)
        expect(res.code).toBe(404)
        expect(res.body.message).toBe('No data to export')
    })

    test('a wrong request stops before the export (the answer was sent by readRequest)', async () => {
        controller.readRequest.mockReturnValue(null)
        const res = makeResponse()
        await exportCustomRange({ user: { role: 'admin' }, params: {}, query: {} }, res)
        expect(controller.getCustomRangeList).not.toHaveBeenCalled()
    })
})
