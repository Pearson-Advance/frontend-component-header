import { useState, useEffect } from 'react';
import { logError } from '@edx/frontend-platform/logging';

import { getUserRolesFromCookie, DEFAULT_ROLES } from '../helpers';

const GLOBAL_STAFF = 'GLOBAL_STAFF';
const INSTITUTION_ADMIN = 'INSTITUTION_ADMIN';
const INSTRUCTOR = 'INSTRUCTOR';
const ROLES_PRIORITY = [GLOBAL_STAFF, INSTITUTION_ADMIN, INSTRUCTOR];

const configCache = new Map();
const inFlightRequests = new Map(); // request de-duplication pattern

async function fetchMfeConfig(id = '') {
  if (configCache.has(id)) {
    return configCache.get(id);
  }

  if (inFlightRequests.has(id)) {
    return inFlightRequests.get(id);
  }

  const request = (async () => {
    try {
      const url = `${process.env.LMS_BASE_URL}/api/mfe_config/v1?mfe=${id}`;
      const response = await fetch(url);

      if (!response.ok) {
        logError('Unable to get mfe settings');
        return {};
      }

      const config = await response.json();
      configCache.set(id, config);
      return config;
    } catch (error) {
      logError('Error fetching MFE config:', error);
      return {};
    } finally {
      inFlightRequests.delete(id);
    }
  })();

  inFlightRequests.set(id, request);
  return request;
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

export function useGetMFEConfig(appID) {
  const [mfeConfig, setMfeConfig] = useState({});

  useEffect(() => {
    fetchMfeConfig(appID).then(setMfeConfig);
  }, [appID]);

  return mfeConfig;
}

function useGetMenuOptionsByRole(appID) {
  const mfeConfig = useGetMFEConfig(appID);

  if (!mfeConfig.ENABLE_DROPDOWN_CUSTOM_OPTIONS) {
    return [];
  }

  const roles = getUserRolesFromCookie();
  return getUserLinksByRole(roles, {
    instructorPath: mfeConfig.INSTRUCTOR_PORTAL_PATH,
    institutionPath: mfeConfig.INSTITUTION_PORTAL_PATH,
  });
}

export default useGetMenuOptionsByRole;
