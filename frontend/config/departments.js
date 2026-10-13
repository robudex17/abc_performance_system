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
  hradmin: '/hr',
  it: '/it',
  uploading: '/uploading',
}

// the url prefix that belongs to a department (sales has none: it owns the pages without a prefix)
export const DEPARTMENT_PREFIXES = ['/csd', '/collection', '/purchasing', '/hr', '/it', '/uploading']

// admin and the top managers choose the department they work on (/select_department)
export const canSwitchDepartment = (user) =>
  user?.role === 'admin' || (user?.role === 'manager' && Number(user?.position_level) >= 10)

// home page of the user's own department, or null (sales agents, standard users, unknown department)
export const getDepartmentHome = (user) => {
  const code = String(user?.department_code || '').toLowerCase()
  return code && code !== 'sales' ? (DEPARTMENT_HOME[code] ?? null) : null
}

// is the path inside the area of the department with this home ('/csd' owns '/csd' and '/csd/...')
export const isInsideArea = (path, areaPrefix) => path === areaPrefix || path.startsWith(areaPrefix + '/')
