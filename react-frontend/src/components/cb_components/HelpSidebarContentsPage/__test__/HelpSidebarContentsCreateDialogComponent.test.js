import React from 'react';
import { render, screen } from '@testing-library/react';

import HelpSidebarContentsCreateDialogComponent from '../HelpSidebarContentsCreateDialogComponent';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { init } from '@rematch/core';
import { Provider } from 'react-redux';
import * as models from '../../../../models';

test('renders helpSidebarContents create dialog', async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <HelpSidebarContentsCreateDialogComponent show={true} />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole('helpSidebarContents-create-dialog-component')).toBeInTheDocument();
});
