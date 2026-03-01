import React from 'react';
import { render, screen } from '@testing-library/react';

import HelpSidebarContentsEditDialogComponent from '../HelpSidebarContentsEditDialogComponent';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { init } from '@rematch/core';
import { Provider } from 'react-redux';
import * as models from '../../../../models';

test('renders helpSidebarContents edit dialog', async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <HelpSidebarContentsEditDialogComponent show={true} />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole('helpSidebarContents-edit-dialog-component')).toBeInTheDocument();
});
