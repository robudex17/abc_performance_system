export const useAccessControl = () => {
  // Menu item rules (all optional):
  //   allowedRoles     -> user.role must be in the list
  //   allowedLevels    -> user.position_level must be in the list
  //   allowedPositions -> user.position must be in the list
  // allowedRoles and allowedLevels are alternatives: matching EITHER one grants access
  // (e.g. allowedRoles: ['admin'] + allowedLevels: [10] = admin or level 10).
  // allowedPositions is an extra restriction on top of that.
  //   excludedRoles    -> user.role in this list is always denied (e.g. hide from admin)
  const canAccess = (user, item) => {
    if (item.excludedRoles && item.excludedRoles.includes(user.role)) return false

    if (!item.allowedRoles && !item.allowedLevels && !item.allowedPositions) return true

    const grants = []
    if (item.allowedRoles) grants.push(item.allowedRoles.includes(user.role))
    if (item.allowedLevels) grants.push(item.allowedLevels.includes(Number(user.position_level)))
    const roleOrLevelMatch = grants.length ? grants.some(Boolean) : true

    const positionMatch = item.allowedPositions
      ? item.allowedPositions.includes(user.position)
      : true

    return roleOrLevelMatch && positionMatch
  }

  return { canAccess }
}
