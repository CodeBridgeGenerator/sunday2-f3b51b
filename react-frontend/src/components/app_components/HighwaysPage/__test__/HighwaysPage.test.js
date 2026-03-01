import React from "react";
import { render, screen } from "@testing-library/react";

import HighwaysPage from "../HighwaysPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../../models";

test("renders highways page", async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <HighwaysPage />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole("highways-datatable")).toBeInTheDocument();
    expect(screen.getByRole("highways-add-button")).toBeInTheDocument();
});
