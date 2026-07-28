export const useAccessControl = () => {
  const canAccess = (user, item) => {
    if (!item.allowedRoles && !item.allowedPositions) return true

    const roleMatch = item.allowedRoles
      ? item.allowedRoles.includes(user.role)
      : true

    const positionMatch = item.allowedPositions
      ? item.allowedPositions.includes(user.position)
      : true

    return roleMatch && positionMatch
  }

  return { canAccess }
}