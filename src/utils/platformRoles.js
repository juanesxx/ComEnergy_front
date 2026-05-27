export function isPlatformAdmin(roles) {
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => String(r).toUpperCase() === "ADMIN");
}
