import { useState, useEffect } from 'react';
import { logError } from '@edx/frontend-platform/logging';

import { getUserRolesFromCookie, DEFAULT_ROLES } from '../helpers';

const GLOBAL_STAFF = 'GLOBAL_STAFF';
const INSTITUTION_ADMIN = 'INSTITUTION_ADMIN';
const INSTRUCTOR = 'INSTRUCTOR';
const ROLES_PRIORITY = [GLOBAL_STAFF, INSTITUTION_ADMIN, INSTRUCTOR];

async function fetchMfeConfig(id = '') {
  const URL = `${process.env.LMS_BASE_URL}/api/mfe_config/v1?mfe=${id}`;
  const res = await fetch(URL);

  if (!res.ok) { return logError('Unable to get mfe settings'); }

  return res.json();
}

function getUserLinksByRole(userRoles, paths) {
  const { instructorPath, institutionPath } = paths;

  const CERTPREP_MANAGER_ITEM = {
    type: 'item',
    href: institutionPath,
    content: 'Skilling Administrator',
  };

  const INSTRUCTOR_PORTAL_ITEM = {
    type: 'item',
    href: instructorPath,
    content: 'Instructor Portal',
  };

  const ROLES_PERMISSIONS = {
    GLOBAL_STAFF: [CERTPREP_MANAGER_ITEM],
    INSTITUTION_ADMIN: [CERTPREP_MANAGER_ITEM],
    INSTRUCTOR: [INSTRUCTOR_PORTAL_ITEM],
  };

  const roles = Array.isArray(userRoles) ? userRoles : [userRoles];
  const validRoles = roles.filter(role => ROLES_PRIORITY.includes(role));

  if (!validRoles.length) { return DEFAULT_ROLES; }

  const sortedRoles = validRoles.sort(
    (a, b) => ROLES_PRIORITY.indexOf(a) - ROLES_PRIORITY.indexOf(b),
  );

  const highestRole = sortedRoles[0];

  if ((highestRole === GLOBAL_STAFF || highestRole === INSTITUTION_ADMIN) && roles.includes(INSTRUCTOR)) {
    return [...(ROLES_PERMISSIONS[highestRole] || []), INSTRUCTOR_PORTAL_ITEM];
  }

  return ROLES_PERMISSIONS[highestRole] || [];
}

export async function loadMenuOptions(appID) {
  const mfeSettings = await fetchMfeConfig(appID);

  if (!mfeSettings.ENABLE_DROPDOWN_CUSTOM_OPTIONS) {
    return [];
  }

  const roles = getUserRolesFromCookie();

  return getUserLinksByRole(roles, {
    instructorPath: mfeSettings.INSTRUCTOR_PORTAL_PATH,
    institutionPath: mfeSettings.INSTITUTION_PORTAL_PATH,
  });
}

function useGetMenuOptionsByRole(appID) {
  const [userLinks, setUserLinks] = useState([]);

  useEffect(() => {
    loadMenuOptions(appID)
      .then(setUserLinks)
      .catch((err) => {
        logError('Error loading custom options:', err);
        setUserLinks([]);
      });
  }, [appID]);

  return userLinks;
}

export default useGetMenuOptionsByRole;
