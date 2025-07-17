
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { preloadCriticalResources, addResourceHints } from "./lib/performance";
import { initAnalytics } from "./utils/analytics";

// Initialize performance optimizations
preloadCriticalResources();
addResourceHints();

// Initialize analytics
initAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
