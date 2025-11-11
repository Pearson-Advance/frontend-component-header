/* eslint-disable react/prop-types */
import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import TestRenderer from 'react-test-renderer';
import { AppContext } from '@edx/frontend-platform/react';
import { Context as ResponsiveContext } from 'react-responsive';
import { render } from '@testing-library/react';

import Header from './index';
import { useGetMFEConfig } from './hooks';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('./hooks', () => ({
  __esModule: true,
  default: jest.fn(() => []),
  useGetMFEConfig: jest.fn(() => ({
    ENABLE_EXAM_DASHBOARD: false,
    EXAM_DASHBOARD_MFE_BASE_URL: 'http://localhost:1994',
  })),
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
    useGetMFEConfig.mockReturnValue({
      ENABLE_EXAM_DASHBOARD: true,
      EXAM_DASHBOARD_MFE_BASE_URL: 'http://localhost:1994',
    });

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
      },
    };
    const component = <HeaderComponent width={{ width: 1280 }} contextValue={contextValue} />;

    const wrapper = render(component);

    const examDashboardLink = wrapper.getAllByRole('link', { name: /exams/i });

    expect(examDashboardLink).toHaveLength(1);
    expect(examDashboardLink[0]).toHaveAttribute('href', 'http://localhost:1994/dashboard');
  });

  it('renders exam dashboard link when ENABLE_EXAM_DASHBOARD is true (mobile)', () => {
    useGetMFEConfig.mockReturnValue({
      ENABLE_EXAM_DASHBOARD: true,
      EXAM_DASHBOARD_MFE_BASE_URL: 'http://localhost:1994',
    });

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
      },
    };
    const component = <HeaderComponent width={{ width: 500 }} contextValue={contextValue} />;

    const wrapper = render(component);

    // Click the main menu button to expand the menu
    const mainMenuButton = wrapper.getByRole('button', { name: /main menu/i });
    mainMenuButton.click();

    // Find the exam dashboard link by its text
    const examDashboardLink = wrapper.getByRole('link', { name: /exams/i });

    expect(examDashboardLink).toBeInTheDocument();
    expect(examDashboardLink).toHaveAttribute('href', 'http://localhost:1994/dashboard');
  });

  it('does not render exam dashboard link when ENABLE_EXAM_DASHBOARD is false', () => {
    useGetMFEConfig.mockReturnValue({
      ENABLE_EXAM_DASHBOARD: false,
    });

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
      },
    };
    const component = <HeaderComponent width={{ width: 1280 }} contextValue={contextValue} />;

    const wrapper = render(component);

    const examDashboardLinks = wrapper.queryAllByRole('link', { name: /exams/i });

    expect(examDashboardLinks).toHaveLength(0);
  });
});
