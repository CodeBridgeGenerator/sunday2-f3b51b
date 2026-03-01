import React from 'react';
import { render, screen } from '@testing-library/react';

import AuditsEditDialogComponent from '../AuditsEditDialogComponent';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { init } from '@rematch/core';
import { Provider } from 'react-redux';
import * as models from '../../../../models';

test('renders audits edit dialog', async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <AuditsEditDialogComponent show={true} />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole('audits-edit-dialog-component')).toBeInTheDocument();
});
