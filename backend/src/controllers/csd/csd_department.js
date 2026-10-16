// The department of the CSD / Collection pages. The evaluation, the leaderboard, the Agent and Team Performance of
// Collection work exactly like the ones of CSD (the same tables, the same scores), only the staff of the list is the staff of the
// department. The page sends ?department=collection (CSD is the default, so the CSD pages do not send anything).
const DEPARTMENTS = ['csd', 'collection']
const DEFAULT_DEPARTMENT = 'csd'

// the department of a request, or null when it is not one of DEPARTMENTS
exports.readDepartment = (req) => {
    const code = String(req.query?.department || DEFAULT_DEPARTMENT).trim().toLowerCase()
    return DEPARTMENTS.includes(code) ? code : null
}

exports.DEPARTMENTS = DEPARTMENTS
exports.DEFAULT_DEPARTMENT = DEFAULT_DEPARTMENT

// for the titles of the Excel files
exports.DEPARTMENT_LABELS = { csd: 'CSD', collection: 'COLLECTION' }

// the answer of the routes for a department that does not exist
exports.badDepartment = (res) => res.status(400).json({ message: `Unknown department. Use ${DEPARTMENTS.join(' or ')}` })
