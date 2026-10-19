// The department of the CSD / Collection / Purchasing pages. The evaluation, the leaderboard, the Agent and Team Performance of
// Collection and Purchasing work exactly like the ones of CSD (the same tables, the same scores), only the staff of the list is the staff of the
// department. The page sends ?department=collection or purchasing (CSD is the default, so the CSD pages do not send anything).
//
// WHO may use a department: admin, poweruser and the GOM (view only) use all of them. The others only use THEIR department: the one of their
// assignment (the login token), or the one(s) named in their position: the "CSD & Collection Manager" and the "CSD & Collections
// Quality Analyst" belong to CSD and also work for Collection. A Purchasing manager (position level 10) does not see the CSD staff,
// and an assistant manager of Collection does not see the CSD staff, whatever the position level rules say.
const DEPARTMENTS = ['csd', 'collection', 'purchasing']
const DEFAULT_DEPARTMENT = 'csd'

const normalize = (text) => String(text ?? '').replace(/\s+/g, ' ').trim().toLowerCase()

// The GOM (position level 15) has the view-only access of the poweruser: every department, every list, no changes.
const GOM_LEVEL = 15
const isFullViewer = (user) => ['admin', 'poweruser'].includes(user?.role) || Number(user?.position_level) === GOM_LEVEL

// may the user use the department?
const mayUseDepartment = (user, code) => {
    if (isFullViewer(user)) return true
    if (normalize(user?.department_code) === code) return true
    return normalize(user?.position_name).includes(code)
}

// the department of a request, or null when it is not one of DEPARTMENTS or the user may not use it
// (res.locals.departmentForbidden tells the second case: badDepartment answers 403)
exports.readDepartment = (req) => {
    const code = String(req.query?.department || DEFAULT_DEPARTMENT).trim().toLowerCase()
    if (!DEPARTMENTS.includes(code)) return null

    if (!mayUseDepartment(req.user, code)) {
        if (req.res) req.res.locals.departmentForbidden = true
        return null
    }
    return code
}

exports.mayUseDepartment = mayUseDepartment
exports.isFullViewer = isFullViewer
exports.DEPARTMENTS = DEPARTMENTS
exports.DEFAULT_DEPARTMENT = DEFAULT_DEPARTMENT

// Staff that is NOT in the evaluation of the department: the Purchasing Manager is based in Japan, his only function is the Leadership
// Individual Performance of the Purchasing team leaders (he is their head) and he sees the Purchasing views like the admin. He has no
// Performance, no feedback and no rating: he is not in the evaluation, the leaderboard, the Agent and Team Performance of the department,
// and his team leaders have no immediate head feedback from him. The position names are compared without the spaces and the capitals.
const EXCLUDED_POSITIONS = {
    purchasing: ['Purchasing Manager'],
}

exports.isExcludedFromEvaluation = (department, row) =>
    (EXCLUDED_POSITIONS[department] ?? []).some(name => normalize(name) === normalize(row?.position_name))

// for the titles of the Excel files
exports.DEPARTMENT_LABELS = { csd: 'CSD', collection: 'COLLECTION', purchasing: 'PURCHASING' }

// the answer of the routes for a department that does not exist, or that the user may not use
exports.badDepartment = (res) => {
    if (res.locals?.departmentForbidden) {
        return res.status(403).json({ message: 'Access Denied: you are not allowed to see the staff of this department' })
    }
    return res.status(400).json({ message: `Unknown department. Use ${DEPARTMENTS.join(', ')}` })
}
