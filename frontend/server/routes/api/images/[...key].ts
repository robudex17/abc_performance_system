// Proxies <baseURL>/api/images/<key> to the Express backend.
// A routeRules proxy can't be used here: with app.baseURL set, Nitro appends the
// base-prefixed path to the target, producing /api/images/<baseURL>/api/images/<key>.
//
// The backend address is NOT written here (it changes with the network). In this order:
//  1. BACKEND_INTERNAL_URL  - the backend as the Nuxt server sees it (e.g. http://backend:8082 in Docker)
//  2. NUXT_PUBLIC_API_URL   - the api url of the app (http://localhost:8082/api) without '/api'
export default defineEventHandler((event) => {
  const key = event.context.params?.key ?? ''

  const apiUrl = String(useRuntimeConfig(event).public.apiUrl || 'http://localhost:8082/api')
  const backend = process.env.BACKEND_INTERNAL_URL || apiUrl.replace(/\/api\/?$/, '')

  return proxyRequest(event, `${backend}/api/images/${key}`)
})
