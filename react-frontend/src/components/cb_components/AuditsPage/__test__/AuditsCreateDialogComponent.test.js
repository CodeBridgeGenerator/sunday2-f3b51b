import React from 'react';
import { render, screen } from '@testing-library/react';

import AuditsCreateDialogComponent from '../AuditsCreateDialogComponent';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { init } from '@rematch/core';
import { Provider } from 'react-redux';
import * as models from '../../../../models';

test('renders audits create dialog', async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <AuditsCreateDialogComponent show={true} />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole('audits-create-dialog-component')).toBeInTheDocument();
});
