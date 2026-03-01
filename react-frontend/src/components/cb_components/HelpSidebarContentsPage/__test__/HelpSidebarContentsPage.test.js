import React from 'react';
import { render, screen } from '@testing-library/react';

import HelpSidebarContentsPage from '../HelpSidebarContentsPage';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { init } from '@rematch/core';
import { Provider } from 'react-redux';
import * as models from '../../../../models';

test('renders helpSidebarContents page', async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <HelpSidebarContentsPage />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole('helpSidebarContents-datatable')).toBeInTheDocument();
    expect(screen.getByRole('helpSidebarContents-add-button')).toBeInTheDocument();
});
