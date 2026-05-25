import React from "react";
import { createRoot } from "react-dom/client";

import { AppRouter } from "@/app/AppRouter";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import "./styles.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  </React.StrictMode>
);
