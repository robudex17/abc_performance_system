// The range of months of the Custom Range page (start and end, YYYY-MM). The same rules as the backend (backend/src/controllers/evaluation/month_range.js):
// the backend is the one that decides, this only tells the user early.
export const MAX_MONTHS = 12

const MONTH_FORMAT = /^(\d{4})-(0[1-9]|1[0-2])$/

// '2026-04' -> a number that grows by one every month (months are compared as numbers, not as dates)
const indexOf = (yearMonth) => {
  const match = MONTH_FORMAT.exec(String(yearMonth ?? ''))
  return match ? Number(match[1]) * 12 + Number(match[2]) - 1 : null
}

export const currentYearMonth = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

// { valid: true, count } or { valid: false, message }
export const checkRange = (start, end) => {
  if (!start || !end) return { valid: false, message: 'Please select the start month and the end month.' }

  const from = indexOf(start)
  const to = indexOf(end)
  if (from === null || to === null) return { valid: false, message: 'Invalid month. Use the month picker.' }
  if (from > to) return { valid: false, message: 'The start month cannot be after the end month.' }
  if (to > indexOf(currentYearMonth())) return { valid: false, message: 'The range cannot go beyond the current month.' }

  const count = to - from + 1
  if (count > MAX_MONTHS) return { valid: false, message: `The range cannot be more than ${MAX_MONTHS} months.` }

  return { valid: true, count }
}

// 'Nov 2025' for '2025-11'
export const monthLabel = (yearMonth) => {
  const match = MONTH_FORMAT.exec(String(yearMonth ?? ''))
  if (!match) return ''
  return `${new Date(Number(match[1]), Number(match[2]) - 1, 1).toLocaleString('en-US', { month: 'short' })} ${match[1]}`
}
