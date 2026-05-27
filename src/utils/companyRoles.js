const RANK = { MEMBER: 1, ADMIN: 2, OWNER: 3 };

export function hasCompanyRole(userRole, minRole) {
  const userRank = RANK[String(userRole || "").toUpperCase()] || 0;
  const minRank = RANK[String(minRole || "").toUpperCase()] || 0;
  return userRank >= minRank;
}

export function canInviteRole(inviterRole, targetRoles) {
  if (!Array.isArray(targetRoles)) {
    targetRoles = [targetRoles];
  }
  return targetRoles.some((role) => hasCompanyRole(inviterRole, role));
}