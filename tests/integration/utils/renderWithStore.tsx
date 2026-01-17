import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { ReactElement, ReactNode } from 'react';
import { createTestStore, type TestStore } from './testStore';
import type { RootState } from '../../../src/store';

interface WrapperProps {
  children: ReactNode;
}

interface RenderWithStoreOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: TestStore;
  routerProps?: MemoryRouterProps;
  withDnd?: boolean;
}

interface RenderWithStoreResult extends ReturnType<typeof render> {
  store: TestStore;
}

export function renderWithStore(
  ui: ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    routerProps = { initialEntries: ['/'] },
    withDnd = true,
    ...renderOptions
  }: RenderWithStoreOptions = {}
): RenderWithStoreResult {
  function Wrapper({ children }: WrapperProps) {
    const content = (
      <Provider store={store}>
        <MemoryRouter {...routerProps}>
          {children}
        </MemoryRouter>
      </Provider>
    );

    if (withDnd) {
      return (
        <DndProvider backend={HTML5Backend}>
          {content}
        </DndProvider>
      );
    }

    return content;
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export function createWrapper(
  preloadedState?: Partial<RootState>,
  routerProps: MemoryRouterProps = { initialEntries: ['/'] }
) {
  const store = createTestStore(preloadedState);

  function Wrapper({ children }: WrapperProps) {
    return (
      <Provider store={store}>
        <MemoryRouter {...routerProps}>
          <DndProvider backend={HTML5Backend}>
            {children}
          </DndProvider>
        </MemoryRouter>
      </Provider>
    );
  }

  return { Wrapper, store };
}
