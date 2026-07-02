export const useMenuBuilder = () => {
  const { canAccess } = useAccessControl()

  const buildMenu = (menuConfig, user) => {
    return menuConfig
      .map(item => {
        if (item.subMenu) {
          const filteredSub = item.subMenu.filter(sub =>
            canAccess(user, sub)
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