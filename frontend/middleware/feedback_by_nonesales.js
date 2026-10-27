// Access check for /feedback/feedback_by_nonesales (none-sales departments).
//   by_member -> the member rates his/her immediate head
//   by_head   -> the immediate head rates his/her members
//
// A feedback is confidential (same setup as the sales feedback pages):
//  - the form page (/feedback/feedback_by_nonesales/:feedback_type) opens ONLY for the user who gives the
//    feedback (who_give_feedback_id), whatever the position level is. Anybody else: Access Denied.
//  - admin and poweruser can open the form page too, but only to VIEW it (the page is read only for them).
//  - the list page (/feedback/feedback_by_nonesales?feedback_type=...) is for the staff that gives feedback;
//    the allowed position levels are the same as the sidebar menu (config/csdMenu.js).
// NOTE: this only guards the page; the backend checks the same rules before it returns or saves any answer.
const ALLOWED_LEVELS = {
  by_member: [9, 8, 7, 3, 2, 1],
  by_head: [10, 9, 8, 7],
}

const VIEWER_ROLES = ['admin', 'poweruser']

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.env.SSR) return

  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()

  const user = authStore.state.user

  // the list page has the type in the query, the form page in the path (/feedback_by_nonesales/:feedback_type)
  const isFormPage = Boolean(to.params.feedback_type)
  const allowedLevels = ALLOWED_LEVELS[to.params.feedback_type || to.query.feedback_type]

  const deny = () => {
    alert('Access Denied')
    return navigateTo('/unauthorized')
  }

  if (!user || !allowedLevels) return deny()

  // admin / poweruser: only the form page and only to view it
  if (VIEWER_ROLES.includes(user.role)) {
    return isFormPage ? undefined : deny()
  }

  // staff: the right position level ...
  if (!allowedLevels.includes(Number(user.position_level))) return deny()

  // the members of an office that is not allowed to rate the head (Japan) have no FEEDBACK HEAD
  if ((to.params.feedback_type || to.query.feedback_type) === 'by_member' && user.head_receives_feedback === false) return deny()

  // ... and the form page only for the one who gives the feedback
  if (isFormPage && Number(to.query.who_give_feedback_id) !== Number(user.login_id)) return deny()
})
