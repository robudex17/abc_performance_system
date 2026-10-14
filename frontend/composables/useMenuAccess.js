// Can the user open a page of a department menu? Uses the SAME rules as the side menu (config/csdMenu.js ...),
// so what is hidden in the menu is also denied when somebody types the address.
//
//  - a page that is not in the menu is not decided here (it has its own middleware)
//  - a sub menu item needs the rules of its group AND its own rules
//  - the same page can be in the menu more than once (e.g. the feedback pages that differ in ?feedback_type):
//    the user can open it when ONE of the items that fit the address is allowed
export const useMenuAccess = () => {
  const { canAccess } = useAccessControl()

  // '/feedback/page?feedback_type=by_head' -> { path: '/feedback/page', query: { feedback_type: 'by_head' } }
  const splitRoute = (route) => {
    const [path, queryString = ''] = String(route).split('?')
    return { path, query: Object.fromEntries(new URLSearchParams(queryString)) }
  }

  // the menu items (with the group they belong to) that are the page of the address
  const findItems = (menu, to) =>
    menu.flatMap(group => {
      const entries = group.subMenu ? group.subMenu.map(sub => ({ item: sub, group })) : [{ item: group, group: null }]
      return entries.filter(({ item }) => {
        if (!item.route) return false
        const { path, query } = splitRoute(item.route)
        return path === to.path && Object.entries(query).every(([key, value]) => String(to.query?.[key]) === value)
      })
    })

  // true when allowed, or when the page is not part of the menu
  const canOpenPath = (menu, user, to) => {
    const items = findItems(menu, to)
    if (items.length === 0) return true
    return items.some(({ item, group }) => canAccess(user, item) && (!group || canAccess(user, group)))
  }

  return { canOpenPath }
}
