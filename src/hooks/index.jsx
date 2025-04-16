import { useState, useEffect } from 'react';
import { initialize, mergeConfig, getConfig } from '@edx/frontend-platform';

import { getUserRolesFromCookie, DEFAULT_ROLES } from '../helpers';

const GLOBAL_STAFF = 'GLOBAL_STAFF';
const INSTITUTION_ADMIN = 'INSTITUTION_ADMIN';
const INSTRUCTOR = 'INSTRUCTOR';
const ROLES_PRIORITY = [GLOBAL_STAFF, INSTITUTION_ADMIN, INSTRUCTOR];

function useInitializeConfig(appID) {
  useEffect(() => {
    initialize({
      messages: [],
      requireAuthenticatedUser: true,
      handlers: {
        config: () => {
          const configOptions = {
            MFE_CONFIG_API_URL: `${process.env.LMS_BASE_URL}/api/mfe_config/v1`,
          };

          if (appID) {
            configOptions.APP_ID = appID;
          }

          mergeConfig(configOptions);
        },
      },
    });
  }, [appID]);
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

function useGetMenuOptionsByRole(appID) {
  const enableDropDownSettings = getConfig().ENABLE_DROPDOWN_CUSTOM_OPTIONS;
  const [userLinks, setUserLinks] = useState([]);

  useInitializeConfig(appID);

  const instructorPath = getConfig().INSTRUCTOR_PORTAL_PATH;
  const institutionPath = getConfig().INSTITUTION_PORTAL_PATH;

  useEffect(() => {
    if (!enableDropDownSettings) {
      setUserLinks([]);
      return;
    }

    const roles = getUserRolesFromCookie();
    const menuOptions = getUserLinksByRole(roles, {
      instructorPath,
      institutionPath,
    });

    setUserLinks(menuOptions);
  }, [instructorPath, institutionPath, enableDropDownSettings]);

  return userLinks;
}

export default useGetMenuOptionsByRole;
