import React from "react";
import ReactDOM from "react-dom/client";
import App from "@src/App";
import { Provider } from "react-redux";
import store from "@src/redux/store";
import "./index.module.scss";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
const queryClient = new QueryClient();

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </Provider>
    </React.StrictMode>
);
