import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider } from "@fluentui/react-components";
import { appDarkTheme } from "./EvaTheme.ts";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FluentProvider theme={appDarkTheme}>
      <App />
    </FluentProvider>
  </StrictMode>
);

console.log("Hello, you fine fellow!");
