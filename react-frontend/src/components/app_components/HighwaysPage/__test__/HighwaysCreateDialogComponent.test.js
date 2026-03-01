import React from "react";
import { render, screen } from "@testing-library/react";

import HighwaysCreateDialogComponent from "../HighwaysCreateDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders highways create dialog", async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <HighwaysCreateDialogComponent show={true} />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole("highways-create-dialog-component")).toBeInTheDocument();
});
