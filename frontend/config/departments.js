// One place that knows where every department lives. Used by the login page, the select department page
// and the department-home route guard (middleware/department-home.global.js).
//
// Sales is still the legacy root ('/'). When the sales pages move to '/sales' later, change it here and
// '/' can become a page that only redirects.

// department code (departments.code in the database) -> home page
export const DEPARTMENT_HOME = {
  sales: '/',
  csd: '/csd',
  collection: '/collection',
  purchasing: '/purchasing',
  gom: '/gom',
  hradmin: '/hr',
  it: '/it',
  uploading: '/uploading',
}

// the url prefix that belongs to a department (sales has none: it owns the pages without a prefix)
export const DEPARTMENT_PREFIXES = ['/csd', '/collection', '/purchasing', '/gom', '/hr', '/it', '/uploading']

// The GOM (position level 15, the head of the managers) has the view-only access of the poweruser to every department and evaluates the managers.
export const GOM_LEVEL = 15
export const isGom = (user) => Number(user?.position_level) === GOM_LEVEL

// admin, the GOM and the top managers of CSD (the CSD & Collection Manager) choose the department they work on (/select_department).
// The manager of another department (the Purchasing Manager) works in his/her own department only.
export const canSwitchDepartment = (user) =>
  user?.role === 'admin' ||
  isGom(user) ||
  (user?.role === 'manager' && Number(user?.position_level) >= 10 && String(user?.department_code || '').toLowerCase() === 'csd')

// The people who pick a department (canSwitchDepartment) land on the picker when they open the address of the system directly. When they
// picked the Sales department in this browser tab, a reload (F5) of the sales page must stay in sales: the choice is remembered for the
// tab (sessionStorage), the picker clears it.
const SALES_CHOICE_KEY = 'picked_sales_department'
export const rememberSalesChoice = (picked) => {
  try {
    if (picked) sessionStorage.setItem(SALES_CHOICE_KEY, '1')
    else sessionStorage.removeItem(SALES_CHOICE_KEY)
  } catch (error) { /* no storage: the reload goes to the picker */ }
}
export const pickedSalesDepartment = () => {
  try { return sessionStorage.getItem(SALES_CHOICE_KEY) === '1' } catch (error) { return false }
}

// home page of the user's own department, or null (sales agents, standard users, unknown department)
export const getDepartmentHome = (user) => {
  const code = String(user?.department_code || '').toLowerCase()
  return code && code !== 'sales' ? (DEPARTMENT_HOME[code] ?? null) : null
}

// is the path inside the area of the department with this home ('/csd' owns '/csd' and '/csd/...')
export const isInsideArea = (path, areaPrefix) => path === areaPrefix || path.startsWith(areaPrefix + '/')

// The CSD & Collections Quality Analyst / Trainer (position level 9, like the assistant managers) gives the QA feedback:
// a score to the CSD staff of position level 8 and below, instead of the questionnaire to his/her members.
// The position is read from the login token (position_name). The backend has the same name: middleware/qa_access.js
export const QA_POSITION_NAME = 'CSD & Collections Quality Analyst/ Trainer'

const normalizePositionName = (text) => String(text ?? '').replace(/\s+/g, ' ').trim().toLowerCase()

export const isQaStaff = (user) => normalizePositionName(user?.position_name) === normalizePositionName(QA_POSITION_NAME)
