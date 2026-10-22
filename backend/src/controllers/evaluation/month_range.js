// The range of months of the Custom Range page (start_date and end_date, YYYY-MM). Pure functions: no database.
const MONTH_FORMAT = /^(\d{4})-(0[1-9]|1[0-2])$/
const MAX_MONTHS = 12

// '2026-04' -> a number that grows by one every month (compared and counted as numbers, never as dates: no timezone)
const indexOf = (yearMonth) => {
    const match = MONTH_FORMAT.exec(String(yearMonth ?? ''))
    return match ? Number(match[1]) * 12 + Number(match[2]) - 1 : null
}

const fromIndex = (index) => `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`

// every month from start to end, both included: ('2025-11', '2026-02') -> ['2025-11', '2025-12', '2026-01', '2026-02']
exports.monthsBetween = (start, end) => {
    const from = indexOf(start), to = indexOf(end)
    if (from === null || to === null || from > to) return []
    return Array.from({ length: to - from + 1 }, (_, i) => fromIndex(from + i))
}

// Checks the range. Returns { months } or { error } (the message is for the user). currentYearMonth: the month of today.
exports.readRange = (start, end, currentYearMonth, maxMonths = MAX_MONTHS) => {
    if (!start || !end) return { error: 'start_date and end_date are required in YYYY-MM format.' }

    const from = indexOf(start), to = indexOf(end)
    if (from === null || to === null) return { error: 'Invalid date format. Use YYYY-MM.' }
    if (from > to) return { error: 'start_date cannot be after end_date.' }
    if (to > indexOf(currentYearMonth)) return { error: 'The range cannot go beyond the current month.' }

    const count = to - from + 1
    if (count > maxMonths) return { error: `The range cannot be more than ${maxMonths} months.` }

    return { months: exports.monthsBetween(start, end) }
}

// The filter of the employee status: all (the default), hired (the ones who work now: Hired and Rehired) or resigned.
const STATUS_FILTERS = {
    all: null,
    hired: ['Hired', 'Rehired'],
    resigned: ['Resigned'],
}

// Returns { statuses } (null = every status) or { error }
exports.readStatusFilter = (value) => {
    const key = String(value ?? 'all').trim().toLowerCase() || 'all'
    if (!(key in STATUS_FILTERS)) return { error: `employee_status must be ${Object.keys(STATUS_FILTERS).join(', ')}` }
    return { statuses: STATUS_FILTERS[key] }
}

exports.MAX_MONTHS = MAX_MONTHS
