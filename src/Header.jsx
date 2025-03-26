import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import Responsive from 'react-responsive';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import {
  APP_CONFIG_INITIALIZED,
  ensureConfig,
  mergeConfig,
  getConfig,
  subscribe,
  initialize,
} from '@edx/frontend-platform';

import {
  DEFAULT_ROLES,
  ROLES_PRIORITY,
  ROLES_PERMISSIONS,
  EDX_HEADER_COOKIE_PAYLOAD,
} from './constants';

import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';

import messages from './Header.messages';

ensureConfig([
  'LMS_BASE_URL',
  'LOGOUT_URL',
  'LOGIN_URL',
  'SITE_NAME',
  'LOGO_URL',
  'ORDER_HISTORY_URL',
], 'Header component');

subscribe(APP_CONFIG_INITIALIZED, () => {
  mergeConfig({
    AUTHN_MINIMAL_HEADER: !!process.env.AUTHN_MINIMAL_HEADER,
  }, 'Header additional config');
});

function getCookie(name) {
  return document.cookie
    .split('; ')
    .map(c => c.split('='))
    .find(([key]) => key === name)?.[1] || null;
}

const getUserLinksByRole = (userRoles) => {
  const roles = Array.isArray(userRoles) ? userRoles : [userRoles];

  if (!roles.length) {
    return DEFAULT_ROLES;
  }

  const validRoles = roles.filter(role => ROLES_PRIORITY.includes(role));

  if (!validRoles.length) {
    return DEFAULT_ROLES;
  }

  const sortedRoles = validRoles.sort((a, b) => ROLES_PRIORITY.indexOf(a) - ROLES_PRIORITY.indexOf(b));

  const highestRole = sortedRoles[0];

  return ROLES_PERMISSIONS[highestRole] || [];
};

const Header = ({ intl, appID }) => {
  useEffect(() => {
    initialize({
      messages: [],
      requireAuthenticatedUser: true,
      handlers: {
        config: () => {
          mergeConfig({
            MFE_CONFIG_API_URL: `${process.env.LMS_BASE_URL}/api/mfe_config/v1`,
            APP_ID: appID,
          });
        },
      },
    });
  }, [appID]);

  const { authenticatedUser, config } = useContext(AppContext);

  const headerPayload = getCookie(EDX_HEADER_COOKIE_PAYLOAD);

  /*
      |￣￣￣￣￣
      | // TODO: Remove this once the cookie implementation is ready
      |＿＿＿_
  (\__/)||
  (•ㅅ•)||
  /  づ
  */
  const roles = 'institution_admin' || DEFAULT_ROLES;
  let f;

  if (headerPayload) {
    const [, payload] = headerPayload.split('.').map(part => JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))));
    f = payload;
  }

  const items = getUserLinksByRole(roles);
  console.log(f);

  const mainMenu = [
    {
      type: 'item',
      href: `${config.LMS_BASE_URL}/dashboard`,
      content: intl.formatMessage(messages['header.links.courses']),
    },
  ];

  const orderHistoryItem = {
    type: 'item',
    href: config.ORDER_HISTORY_URL,
    content: intl.formatMessage(messages['header.user.menu.order.history']),
  };

  const userMenu = authenticatedUser === null ? [] : [
    {
      type: 'item',
      href: `${config.LMS_BASE_URL}/dashboard`,
      content: intl.formatMessage(messages['header.user.menu.dashboard']),
    },
    ...items,
    {
      type: 'item',
      href: `${config.ACCOUNT_PROFILE_URL}/u/${authenticatedUser.username}`,
      content: intl.formatMessage(messages['header.user.menu.profile']),
    },
    {
      type: 'item',
      href: config.ACCOUNT_SETTINGS_URL,
      content: intl.formatMessage(messages['header.user.menu.account.settings']),
    },
    {
      type: 'item',
      href: config.LOGOUT_URL,
      content: intl.formatMessage(messages['header.user.menu.logout']),
    },
  ];

  // Users should only see Order History if have a ORDER_HISTORY_URL define in the environment.
  if (config.ORDER_HISTORY_URL) {
    userMenu.splice(-1, 0, orderHistoryItem);
  }

  const loggedOutItems = [
    {
      type: 'item',
      href: config.LOGIN_URL,
      content: intl.formatMessage(messages['header.user.menu.login']),
    },
    {
      type: 'item',
      href: `${config.LMS_BASE_URL}/register`,
      content: intl.formatMessage(messages['header.user.menu.register']),
    },
  ];

  const props = {
    logo: config.LOGO_URL,
    logoAltText: config.SITE_NAME,
    logoDestination: `${config.LMS_BASE_URL}/dashboard`,
    loggedIn: authenticatedUser !== null,
    username: authenticatedUser !== null ? authenticatedUser?.name || authenticatedUser.username : null,
    avatar: authenticatedUser !== null ? authenticatedUser.avatar : null,
    mainMenu: getConfig().AUTHN_MINIMAL_HEADER ? [] : mainMenu,
    userMenu: getConfig().AUTHN_MINIMAL_HEADER ? [] : userMenu,
    loggedOutItems: getConfig().AUTHN_MINIMAL_HEADER ? [] : loggedOutItems,
  };

  return (
    <>
      <Responsive maxWidth={768}>
        <MobileHeader {...props} />
      </Responsive>
      <Responsive minWidth={769}>
        <DesktopHeader {...props} />
      </Responsive>
    </>
  );
};

Header.propTypes = {
  intl: intlShape.isRequired,
  appID: PropTypes.string,
};

Header.defaultProps = {
  appID: 'header-component',
};

export default injectIntl(Header);
