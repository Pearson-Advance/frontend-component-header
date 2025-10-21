/* eslint-disable react/prop-types */
import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import TestRenderer from 'react-test-renderer';
import { AppContext } from '@edx/frontend-platform/react';
import { Context as ResponsiveContext } from 'react-responsive';

import Header from './index';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

const HeaderComponent = ({ width, contextValue }) => (
  <ResponsiveContext.Provider value={width}>
    <IntlProvider locale="en" messages={{}}>
      <AppContext.Provider
        value={contextValue}
      >
        <Header />
      </AppContext.Provider>
    </IntlProvider>
  </ResponsiveContext.Provider>
);

describe('<Header />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for anonymous desktop', () => {
    const contextValue = {
      authenticatedUser: null,
      config: {
        LMS_BASE_URL: process.env.LMS_BASE_URL,
        SITE_NAME: process.env.SITE_NAME,
        LOGIN_URL: process.env.LOGIN_URL,
        LOGOUT_URL: process.env.LOGOUT_URL,
        LOGO_URL: process.env.LOGO_URL,
        ENABLE_EXAM_DASHBOARD: false,
      },
    };
    const component = <HeaderComponent width={{ width: 1280 }} contextValue={contextValue} />;

    const wrapper = TestRenderer.create(component);

    expect(wrapper.toJSON()).toMatchSnapshot();
  });

  it('renders correctly for authenticated desktop', () => {
    const contextValue = {
      authenticatedUser: {
        userId: 'abc123',
        username: 'edX',
        roles: [],
        administrator: false,
      },
      config: {
        LMS_BASE_URL: process.env.LMS_BASE_URL,
        SITE_NAME: process.env.SITE_NAME,
        LOGIN_URL: process.env.LOGIN_URL,
        LOGOUT_URL: process.env.LOGOUT_URL,
        LOGO_URL: process.env.LOGO_URL,
        ENABLE_EXAM_DASHBOARD: false,
      },
    };
    const component = <HeaderComponent width={{ width: 1280 }} contextValue={contextValue} />;

    const wrapper = TestRenderer.create(component);

    expect(wrapper.toJSON()).toMatchSnapshot();
  });

  it('renders correctly for anonymous mobile', () => {
    const contextValue = {
      authenticatedUser: null,
      config: {
        LMS_BASE_URL: process.env.LMS_BASE_URL,
        SITE_NAME: process.env.SITE_NAME,
        LOGIN_URL: process.env.LOGIN_URL,
        LOGOUT_URL: process.env.LOGOUT_URL,
        LOGO_URL: process.env.LOGO_URL,
        ENABLE_EXAM_DASHBOARD: false,
      },
    };
    const component = <HeaderComponent width={{ width: 500 }} contextValue={contextValue} />;

    const wrapper = TestRenderer.create(component);

    expect(wrapper.toJSON()).toMatchSnapshot();
  });

  it('renders correctly for authenticated mobile', () => {
    const contextValue = {
      authenticatedUser: {
        userId: 'abc123',
        username: 'edX',
        roles: [],
        administrator: false,
      },
      config: {
        LMS_BASE_URL: process.env.LMS_BASE_URL,
        SITE_NAME: process.env.SITE_NAME,
        LOGIN_URL: process.env.LOGIN_URL,
        LOGOUT_URL: process.env.LOGOUT_URL,
        LOGO_URL: process.env.LOGO_URL,
        ENABLE_EXAM_DASHBOARD: false,
      },
    };
    const component = <HeaderComponent width={{ width: 500 }} contextValue={contextValue} />;

    const wrapper = TestRenderer.create(component);

    expect(wrapper.toJSON()).toMatchSnapshot();
  });

  it('renders exam dashboard link when ENABLE_EXAM_DASHBOARD is true (desktop)', () => {
    const contextValue = {
      authenticatedUser: {
        userId: 'abc123',
        username: 'edX',
        roles: [],
        administrator: false,
      },
      config: {
        LMS_BASE_URL: process.env.LMS_BASE_URL,
        SITE_NAME: process.env.SITE_NAME,
        LOGIN_URL: process.env.LOGIN_URL,
        LOGOUT_URL: process.env.LOGOUT_URL,
        LOGO_URL: process.env.LOGO_URL,
        ENABLE_EXAM_DASHBOARD: true,
        EXAM_DASHBOARD_MFE_BASE_URL: 'http://localhost:1994',
      },
    };
    const component = <HeaderComponent width={{ width: 1280 }} contextValue={contextValue} />;

    const wrapper = TestRenderer.create(component);

    expect(wrapper.toJSON()).toMatchSnapshot();
  });

  it('renders exam dashboard link when ENABLE_EXAM_DASHBOARD is true (mobile)', () => {
    const contextValue = {
      authenticatedUser: {
        userId: 'abc123',
        username: 'edX',
        roles: [],
        administrator: false,
      },
      config: {
        LMS_BASE_URL: process.env.LMS_BASE_URL,
        SITE_NAME: process.env.SITE_NAME,
        LOGIN_URL: process.env.LOGIN_URL,
        LOGOUT_URL: process.env.LOGOUT_URL,
        LOGO_URL: process.env.LOGO_URL,
        ENABLE_EXAM_DASHBOARD: true,
        EXAM_DASHBOARD_MFE_BASE_URL: 'http://localhost:1994',
      },
    };
    const component = <HeaderComponent width={{ width: 500 }} contextValue={contextValue} />;

    const wrapper = TestRenderer.create(component);

    expect(wrapper.toJSON()).toMatchSnapshot();
  });

  it('does not render exam dashboard link when ENABLE_EXAM_DASHBOARD is false', () => {
    const contextValue = {
      authenticatedUser: {
        userId: 'abc123',
        username: 'edX',
        roles: [],
        administrator: false,
      },
      config: {
        LMS_BASE_URL: process.env.LMS_BASE_URL,
        SITE_NAME: process.env.SITE_NAME,
        LOGIN_URL: process.env.LOGIN_URL,
        LOGOUT_URL: process.env.LOGOUT_URL,
        LOGO_URL: process.env.LOGO_URL,
        ENABLE_EXAM_DASHBOARD: false,
      },
    };
    const component = <HeaderComponent width={{ width: 1280 }} contextValue={contextValue} />;

    const wrapper = TestRenderer.create(component);

    // Verify that the exam dashboard link is not present in the snapshot
    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});
