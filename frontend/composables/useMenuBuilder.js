export const useMenuBuilder = () => {
  const { canAccess } = useAccessControl()

  const buildMenu = (menuConfig, user) => {
    return menuConfig
      .map(item => {
        // the group itself can be restricted too (hides the whole group and its sub menus)
        if (!canAccess(user, item)) return null

        if (item.subMenu) {
          // hidden items are only for the page guard (middleware/csd-menu-access.global.js), they are not shown
          const filteredSub = item.subMenu.filter(sub =>
            !sub.hidden && canAccess(user, sub)
          )

          if (filteredSub.length === 0) return null

          return {
            ...item,
            subMenu: filteredSub
          }
        }

        return canAccess(user, item) ? item : null
      })
      .filter(Boolean)
  }

  return { buildMenu }
}