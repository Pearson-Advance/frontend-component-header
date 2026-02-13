const EDX_HEADER_COOKIE_PAYLOAD = 'edx-jwt-cookie-header-payload';
const DEFAULT_ROLES = [];

function getCookie(name) {
  return document.cookie
    .split('; ')
    .map(c => c.split('='))
    .find(([key]) => key === name)?.[1] || null;
}

function getUserRolesFromCookie() {
  let roles = DEFAULT_ROLES;
  const headerPayload = getCookie(EDX_HEADER_COOKIE_PAYLOAD);

  if (headerPayload) {
    const [, payload] = headerPayload.split('.')
      .map(part => JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))));
    roles = payload?.extra_data?.permission_roles || DEFAULT_ROLES;

    return roles;
  }

  return roles;
}

export { getUserRolesFromCookie, DEFAULT_ROLES };
