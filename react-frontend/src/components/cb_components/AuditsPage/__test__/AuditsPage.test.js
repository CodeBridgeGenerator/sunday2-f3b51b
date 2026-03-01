import React from 'react';
import { render, screen } from '@testing-library/react';

import AuditsPage from '../AuditsPage';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { init } from '@rematch/core';
import { Provider } from 'react-redux';
import * as models from '../../../../models';

test('renders audits page', async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <AuditsPage />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole('audits-datatable')).toBeInTheDocument();
    expect(screen.getByRole('audits-add-button')).toBeInTheDocument();
});
