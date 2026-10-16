// The department (csd / collection) of the page that is open, read from the url: the pages of pages/csd are also the pages
// of Collection (alias /collection/...), see config/departmentViews.js.
//   code    'csd' | 'collection'
//   base    '/csd' | '/collection'  (the prefix of the links of the page)
//   query   adds ?department=... to a query: the backend answers with the staff of THAT department
import { computed } from 'vue'
import { departmentViewOfPath } from '~/config/departmentViews'

export const useDepartmentView = () => {
  const route = useRoute()
  const view = computed(() => departmentViewOfPath(route.path))

  return {
    view,
    code: computed(() => view.value.code),
    base: computed(() => view.value.base),
    label: computed(() => view.value.label),
    query: (query = {}) => ({ ...query, department: view.value.code }),
  }
}
