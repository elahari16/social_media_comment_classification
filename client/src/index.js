import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

// Preload critical resources
const preloadResources = () => {
  // Add preload links for critical resources
  const preloadLinks = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://robohash.org' },
  ];

  preloadLinks.forEach(link => {
    const linkEl = document.createElement('link');
    linkEl.rel = link.rel;
    linkEl.href = link.href;
    document.head.appendChild(linkEl);
  });
};

// Execute preload before rendering
preloadResources();

// Use createRoot API
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render without StrictMode for production
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
