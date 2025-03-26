const CERTPREP_MANAGER = {
  type: 'item',
  href: '/certprep-manager',
  content: 'CertPREP Manager',
};
const INSTRUCTOR_PORTAL = {
  type: 'item',
  href: '/instructor-portal',
  content: 'Instructor Portal',
};

export const EDX_HEADER_COOKIE_PAYLOAD = 'edx-jwt-cookie-header-payload';

export const DEFAULT_ROLES = [];

export const ROLES_PERMISSIONS = {
  admin: [CERTPREP_MANAGER, INSTRUCTOR_PORTAL],
  global_staff: [CERTPREP_MANAGER, INSTRUCTOR_PORTAL],
  institution_admin: [CERTPREP_MANAGER, INSTRUCTOR_PORTAL],
  institution_instructor: [INSTRUCTOR_PORTAL],
};

export const ROLES_PRIORITY = [
  'admin',
  'global_staff',
  'institution_admin',
  'institution_instructor',
];
