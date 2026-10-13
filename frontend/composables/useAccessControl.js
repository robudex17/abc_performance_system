export const useAccessControl = () => {
  // Menu item rules (all optional):
  //   allowedRoles          -> user.role must be in the list
  //   allowedLevels         -> user.position_level must be in the list
  //   allowedPositions      -> user.position must be in the list
  //   allowedPositionNames  -> user.position_name must be one of the names (spaces and capitals do not matter)
  // allowedRoles and allowedLevels are alternatives: matching EITHER one grants access
  // (e.g. allowedRoles: ['admin'] + allowedLevels: [10] = admin or level 10).
  // allowedPositions and allowedPositionNames are extra restrictions on top of that.
  //   excludedRoles         -> user.role in this list is always denied (e.g. hide from admin)
  //   excludedPositionNames -> user.position_name in this list is always denied (e.g. hide from the Quality Analyst)
  const normalize = (text) => String(text ?? '').replace(/\s+/g, ' ').trim().toLowerCase()
  const isOneOfThePositionNames = (user, names) => names.some(name => normalize(name) === normalize(user.position_name))

  const canAccess = (user, item) => {
    if (item.excludedRoles && item.excludedRoles.includes(user.role)) return false
    if (item.excludedPositionNames && isOneOfThePositionNames(user, item.excludedPositionNames)) return false

    if (!item.allowedRoles && !item.allowedLevels && !item.allowedPositions && !item.allowedPositionNames) return true

    const grants = []
    if (item.allowedRoles) grants.push(item.allowedRoles.includes(user.role))
    if (item.allowedLevels) grants.push(item.allowedLevels.includes(Number(user.position_level)))
    const roleOrLevelMatch = grants.length ? grants.some(Boolean) : true

    const positionMatch = item.allowedPositions
      ? item.allowedPositions.includes(user.position)
      : true

    const positionNameMatch = item.allowedPositionNames
      ? isOneOfThePositionNames(user, item.allowedPositionNames)
      : true

    return roleOrLevelMatch && positionMatch && positionNameMatch
  }

  return { canAccess }
}
