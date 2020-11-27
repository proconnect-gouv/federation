import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import ApplicationLayout, {
  getCurrentRouteObjectByPath,
  getDocumentTitle,
} from './index';

const ROUTES_MOCK = [
  {
    component: () => <section />,
    exact: true,
    id: 'mock-id-0',
    path: '/',
    title: '',
  },
  {
    component: () => (
      <section>
        <h1>Section title</h1>
      </section>
    ),
    exact: true,
    id: 'mock-id-1',
    path: '/mock-path',
    title: 'mock-path-title',
  },
  {
    component: () => <section />,
    exact: true,
    id: 'mock-id-2',
    path: '/mock-path/1234',
    title: 'mock-path-title-1234',
  },
];

describe('ApplicationLayout', () => {
  describe('render', () => {
    it('should render application layout with page title for mock-path route when component is mounted', async () => {
      const { path } = ROUTES_MOCK[1];
      const { getByRole } = render(
        <MemoryRouter initialEntries={[path]} initialIndex={0}>
          <ApplicationLayout routes={ROUTES_MOCK} />
        </MemoryRouter>,
      );
      await waitFor(() =>
        expect(document.title).toStrictEqual('mock-path-title - AgentConnect'),
      );
      expect(getByRole('heading')).toHaveTextContent('Section title');
    });
  });

  describe('getCurrentRouteObjectByPath', () => {
    it('should return the route object matching the current browser url', () => {
      const { path } = ROUTES_MOCK[1];
      const result = getCurrentRouteObjectByPath(ROUTES_MOCK, path);
      expect(result).toStrictEqual(ROUTES_MOCK[1]);
    });
  });

  describe('getDocumentTitle', () => {
    it('should return a title with AgentConnect prefix', () => {
      const route = ROUTES_MOCK[1];
      const result = getDocumentTitle(route);
      expect(result).toStrictEqual('mock-path-title - AgentConnect');
    });

    it("should return a title only containing AgentConnect, because route's title is empty", () => {
      const route = ROUTES_MOCK[0];
      const result = getDocumentTitle(route);
      expect(result).toStrictEqual('AgentConnect');
    });
  });
});
