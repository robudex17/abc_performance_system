const ExcelJS = require('exceljs')
const { getCustomRangeList, getCustomRangeOne, readRequest } = require('./custom_range_controller')
const { excel } = require('./leaderboard_export')
const { shared: exportShared } = require('./agent_performance_export')
const { DEPARTMENT_LABELS } = require('./department_scope')
const { getDataBorder, getHeaderBorder, getHeaderStyle } = require('../helper_scripts/global_variables_and_functions')

// Excel of the Custom Range page (the same look as the yearly Excel).
//   GET /evaluation/custom_range_export?start_date=&end_date=&employee_status=&department=      the list
//   GET /evaluation/custom_range_export/:employee_id?start_date=&end_date=&department=            one employee: the months + the summary
// Admin, poweruser and the GOM (middleware canUseCustomRange). Like the page, only the submitted months are in it.
const { writeTable, capitalize, toNumber, RATING_COLORS, leadershipOf } = excel
const { metricsOf, writeMetricsSummary, send } = exportShared

const rangeLabel = (average) => `${average.start_date} to ${average.end_date}`

const writeRangeList = (rows, worksheet, title) => {
    const headers = ['START', 'END', 'EMPLOYEE NAME', 'EMPLOYEE STATUS', 'POSITION', 'TEAM', 'MONTHS COUNTED', 'PERFORMANCE (%)', 'LEADERSHIP (SCORE)', 'RATING', 'RATING NAME']
    const widths = [10, 10, 20, 18, 30, 20, 16, 16, 20, 12, 24]

    worksheet.mergeCells(1, 1, 1, headers.length)
    const titleCell = worksheet.getCell(1, 1)
    titleCell.value = title
    titleCell.font = { bold: true, size: 24 }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getRow(1).height = 30

    headers.forEach((label, index) => {
        const cell = worksheet.getCell(2, index + 1)
        cell.value = label
        cell.style = getHeaderStyle()
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = getHeaderBorder()
    })
    worksheet.columns = widths.map(width => ({ width }))

    rows.forEach((row, index) => {
        const excelRow = worksheet.getRow(3 + index)
        excelRow.values = [
            row.start_date, row.end_date, capitalize(row.db_name), row.employee_status || '', row.position_name || '', (row.team_name || '').toUpperCase(),
            `${row.months_submitted} / ${row.months_in_range}`, toNumber(row.performance), leadershipOf(row), toNumber(row.final_ratings), row.ratings_name || '',
        ]
        excelRow.eachCell((cell, colNumber) => {
            cell.border = getDataBorder()
            cell.alignment = { horizontal: 'center', vertical: 'middle' }
            if (colNumber === 4) cell.font = { bold: true, color: { argb: cell.value === 'Resigned' ? 'DB211A' : '14DB3C' } }
            if (colNumber === 11) {
                const colors = RATING_COLORS[cell.value] || { fill: 'FFFFFF', font: '000000' }
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.fill } }
                cell.font = { bold: true, color: { argb: colors.font } }
            }
        })
    })
}

exports.exportCustomRange = async (req, res) => {
    const request = readRequest(req, res)
    if (!request) return

    try {
        const workbook = new ExcelJS.Workbook()
        const employeeId = req.params.employee_id

        if (employeeId) {
            const data = await getCustomRangeOne(req.user, request.months, request.department, employeeId)
            if (!data) return res.status(404).json({ message: 'No data to export' })

            const average = data.rangeAverage
            const worksheet = workbook.addWorksheet(`${capitalize(average.db_name)}-RANGE`.slice(0, 31))
            writeTable(data.agentMetricsInRange, worksheet, `${capitalize(average.db_name)} - (CUSTOM RANGE ${rangeLabel(average)}) ${average.final_ratings} / ${average.ratings_name}`)
            writeMetricsSummary(worksheet, worksheet.lastRow.number + 3, 'Metrics Range Summary', metricsOf(average, undefined), false)
            return await send(res, workbook, `${request.department}-${average.db_name}-custom-range-${average.start_date}-${average.end_date}.xlsx`)
        }

        const rows = await getCustomRangeList(req.user, request.months, request.department, request.statuses)
        if (rows.length === 0) return res.status(404).json({ message: 'No data to export' })

        const worksheet = workbook.addWorksheet('CUSTOM-RANGE')
        writeRangeList(rows, worksheet, `${DEPARTMENT_LABELS[request.department]} AGENTS CUSTOM RANGE ${rangeLabel(rows[0])}`)
        return await send(res, workbook, `${request.department}-agents-custom-range-${rows[0].start_date}-${rows[0].end_date}.xlsx`)
    } catch (error) {
        console.error('Error exporting the custom range', error)
        if (!res.headersSent) res.status(500).json({ error: 'Error, Cannot export the custom range' })
    }
}
